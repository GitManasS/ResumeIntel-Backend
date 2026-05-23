import Organization from '../models/Organization.js';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const ORG_ROLE_LABELS = {
  org_admin: 'Organization Admin',
  hr_manager: 'HR Manager',
  recruiter: 'Recruiter',
  interviewer: 'Interviewer',
};

export const organizationService = {
  async list() {
    const organizations = await Organization.find()
      .sort({ name: 1 })
      .lean();

    const withCounts = await Promise.all(
      organizations.map(async (org) => {
        const staffCount = await User.countDocuments({
          organization: org._id,
          orgRole: { $exists: true, $ne: null },
        });
        return { ...org, staffCount };
      })
    );

    return withCounts;
  },

  async getById(orgId) {
    const organization = await Organization.findById(orgId).lean();
    if (!organization) throw ApiError.notFound('Organization not found');

    const members = await User.find({
      organization: orgId,
      orgRole: { $exists: true, $ne: null },
    })
      .select('name email orgRole title isActive lastLogin createdAt')
      .sort({ orgRole: 1, name: 1 })
      .lean();

    return {
      organization,
      members: members.map((m) => ({
        ...m,
        orgRoleLabel: ORG_ROLE_LABELS[m.orgRole] || m.orgRole,
      })),
      roleLabels: ORG_ROLE_LABELS,
    };
  },

  async create(data) {
    let slug = data.slug?.trim() || slugify(data.name);
    if (!slug) throw ApiError.badRequest('Invalid organization name');

    const existing = await Organization.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
    }

    const organization = await Organization.create({
      name: data.name,
      slug,
      industry: data.industry,
      size: data.size,
      website: data.website,
      branding: {
        primaryColor: data.branding?.primaryColor || '#3396fc',
        tagline: data.branding?.tagline,
        about: data.branding?.about,
      },
      settings: { careerPortalEnabled: true },
    });

    return organization;
  },

  async update(orgId, data) {
    const organization = await Organization.findByIdAndUpdate(
      orgId,
      {
        ...(data.name && { name: data.name }),
        ...(data.industry !== undefined && { industry: data.industry }),
        ...(data.size && { size: data.size }),
        ...(data.website !== undefined && { website: data.website }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.branding && { branding: data.branding }),
      },
      { new: true, runValidators: true }
    );
    if (!organization) throw ApiError.notFound('Organization not found');
    return organization;
  },

  async listMembers(orgId) {
    const org = await Organization.findById(orgId);
    if (!org) throw ApiError.notFound('Organization not found');

    return User.find({
      organization: orgId,
      orgRole: { $exists: true, $ne: null },
    })
      .select('name email orgRole title isActive lastLogin createdAt')
      .sort({ orgRole: 1, name: 1 });
  },

  async addMember(orgId, { name, email, password, orgRole, title }) {
    const org = await Organization.findById(orgId);
    if (!org) throw ApiError.notFound('Organization not found');
    if (!org.isActive) throw ApiError.badRequest('Organization is inactive');

    const existing = await User.findOne({ email });
    if (existing) throw ApiError.conflict('Email already registered');

    const user = await User.create({
      name,
      email,
      password,
      role: 'recruiter',
      organization: orgId,
      orgRole,
      title,
      company: org.name,
    });

    const safe = user.toJSON();
    return safe;
  },

  async updateMember(orgId, userId, data) {
    const user = await User.findOne({
      _id: userId,
      organization: orgId,
      orgRole: { $exists: true, $ne: null },
    });

    if (!user) throw ApiError.notFound('Team member not found');

    if (data.name) user.name = data.name;
    if (data.orgRole) user.orgRole = data.orgRole;
    if (data.title !== undefined) user.title = data.title;
    if (data.isActive !== undefined) user.isActive = data.isActive;
    if (data.password) user.password = data.password;

    await user.save();
    return user.toJSON();
  },

  async removeMember(orgId, userId) {
    const user = await User.findOne({
      _id: userId,
      organization: orgId,
      orgRole: { $exists: true, $ne: null },
    });

    if (!user) throw ApiError.notFound('Team member not found');

    user.isActive = false;
    await user.save();

    return { message: 'Member deactivated' };
  },
};

export default organizationService;
