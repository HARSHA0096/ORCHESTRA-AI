import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
