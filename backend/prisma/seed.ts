import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


async function seedDemoData(): Promise<string | undefined> {
  if (process.env.DEMO_MODE !== 'true') return undefined;

  const organization = await prisma.organization.upsert({
    where: { slug: 'orchestra-demo' },
    update: { name: 'ORCHESTRA Demo Organization', status: 'ACTIVE' },
    create: { name: 'ORCHESTRA Demo Organization', slug: 'orchestra-demo', description: 'Deterministic submission/demo environment.' },
  });

  const project = await prisma.project.upsert({
    where: { organizationId_slug: { organizationId: organization.id, slug: 'orchestra-demo' } },
    update: { name: 'ORCHESTRA Demo Project', status: 'ACTIVE' },
    create: { name: 'ORCHESTRA Demo Project', slug: 'orchestra-demo', organizationId: organization.id, description: 'Submission demo project.' },
  });

  const provider = await prisma.provider.upsert({
    where: { name: 'demo' },
    update: { displayName: 'Orchestra Demo', status: 'ACTIVE', type: 'CUSTOM' },
    create: { name: 'demo', displayName: 'Orchestra Demo', status: 'ACTIVE', type: 'CUSTOM', description: 'Deterministic provider for evaluation and demos.' },
  });

  const models = [
    ['orchestra-demo-model', 'Orchestra Demo Model'],
    ['orchestra-fast-demo', 'Orchestra Fast Demo'],
    ['orchestra-reasoning-demo', 'Orchestra Reasoning Demo'],
    ['orchestra-demo-failure', 'Orchestra Demo Failure'],
  ];
  for (const [modelId, name] of models) {
    await prisma.providerModel.upsert({
      where: { providerId_modelId: { providerId: provider.id, modelId } },
      update: { name, inputCostPer1k: 0.001, outputCostPer1k: 0.002, contextWindow: 128000, maxOutputTokens: 8192, status: 'ACTIVE', capabilities: ['chat', 'streaming'] },
      create: { providerId: provider.id, modelId, name, inputCostPer1k: 0.001, outputCostPer1k: 0.002, contextWindow: 128000, maxOutputTokens: 8192, status: 'ACTIVE', capabilities: ['chat', 'streaming'] },
    });
  }

  const existingBudget = await prisma.budget.findFirst({ where: { projectId: project.id, deletedAt: null }, orderBy: { updatedAt: 'desc' } });
  if (existingBudget) {
    await prisma.budget.update({ where: { id: existingBudget.id }, data: { limitAmount: 100, currency: 'USD' } });
  } else {
    await prisma.budget.create({ data: { projectId: project.id, period: 'MONTHLY', limitAmount: 100, currentSpend: 0, currency: 'USD' } });
  }

  console.log(`  ✓ Demo project: ${project.id}`);
  return project.id;
}

async function seed(): Promise<void> {
  console.log('🌱 Seeding database...');

  // Create default permissions
  const permissionDefs = [
    { resource: 'user', action: 'create' },
    { resource: 'user', action: 'read' },
    { resource: 'user', action: 'update' },
    { resource: 'user', action: 'delete' },
    { resource: 'organization', action: 'create' },
    { resource: 'organization', action: 'read' },
    { resource: 'organization', action: 'update' },
    { resource: 'organization', action: 'delete' },
    { resource: 'project', action: 'create' },
    { resource: 'project', action: 'read' },
    { resource: 'project', action: 'update' },
    { resource: 'project', action: 'delete' },
    { resource: 'api-key', action: 'create' },
    { resource: 'api-key', action: 'read' },
    { resource: 'api-key', action: 'update' },
    { resource: 'api-key', action: 'delete' },
    { resource: 'api-key', action: 'rotate' },
    { resource: 'api-key', action: 'revoke' },
    { resource: 'provider', action: 'create' },
    { resource: 'provider', action: 'read' },
    { resource: 'provider', action: 'update' },
    { resource: 'provider', action: 'delete' },
    { resource: 'audit', action: 'read' },
    { resource: 'notification', action: 'read' },
    { resource: 'notification', action: 'update' },
  ];

  const permissions = [];
  for (const def of permissionDefs) {
    const perm = await prisma.permission.upsert({
      where: { resource_action: { resource: def.resource, action: def.action } },
      update: {},
      create: {
        resource: def.resource,
        action: def.action,
        description: `${def.action} ${def.resource}`,
      },
    });
    permissions.push(perm);
  }
  console.log(`  ✓ Created ${permissions.length} permissions`);

  // Create default roles
  const roleDefs = [
    { name: 'Super Admin', description: 'Full system access', isSystem: true },
    { name: 'Org Admin', description: 'Organization-level admin', isSystem: true },
    { name: 'Developer', description: 'Standard developer access', isSystem: true },
    { name: 'Viewer', description: 'Read-only access', isSystem: true },
  ];

  for (const roleDef of roleDefs) {
    const role = await prisma.role.upsert({
      where: { name: roleDef.name },
      update: {},
      create: roleDef,
    });

    // Assign permissions based on role
    let rolePermissions: typeof permissions = [];

    switch (roleDef.name) {
      case 'Super Admin':
        rolePermissions = permissions;
        break;
      case 'Org Admin':
        rolePermissions = permissions.filter((p) => p.resource !== 'provider' || p.action === 'read');
        break;
      case 'Developer':
        rolePermissions = permissions.filter(
          (p) =>
            ['read', 'create', 'update'].includes(p.action) &&
            !['user'].includes(p.resource),
        );
        break;
      case 'Viewer':
        rolePermissions = permissions.filter((p) => p.action === 'read');
        break;
    }

    for (const perm of rolePermissions) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
        update: {},
        create: { roleId: role.id, permissionId: perm.id },
      });
    }

    console.log(`  ✓ Role "${roleDef.name}" → ${rolePermissions.length} permissions`);
  }

  const demoProjectId = await seedDemoData();
  if (demoProjectId) console.log(`  DEMO_PROJECT_ID=${demoProjectId}`);

  console.log('✅ Seeding complete!');
}

seed()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
