"""Add organization_members table and organization invite_code

Revision ID: 002_add_organization_members
Revises: 001_initial_migration
Create Date: 2026-08-16T04:00:00.000000+00:00

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '002_add_organization_members'
down_revision: Union[str, None] = '001_initial_migration'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add invite_code to organizations
    op.add_column(
        'organizations',
        sa.Column('invite_code', sa.String(length=64), nullable=True)
    )
    # Seed default invite_code for existing organizations if any
    op.execute("UPDATE organizations SET invite_code = substring(md5(random()::text || clock_timestamp()::text), 1, 12) WHERE invite_code IS NULL")
    op.alter_column('organizations', 'invite_code', nullable=False)
    op.create_index(op.f('ix_organizations_invite_code'), 'organizations', ['invite_code'], unique=True)

    # 2. Modify users table: make organization_id nullable or remove direct organization_id dependency
    op.alter_column('users', 'organization_id', nullable=True)
    op.add_column('users', sa.Column('full_name', sa.String(length=255), nullable=True))

    # 3. Create organization_members table
    op.create_table(
        'organization_members',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False, server_default='member'),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='active'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('organization_id', 'user_id', name='uq_org_member')
    )
    op.create_index(op.f('ix_organization_members_organization_id'), 'organization_members', ['organization_id'], unique=False)
    op.create_index(op.f('ix_organization_members_user_id'), 'organization_members', ['user_id'], unique=False)

    # Backfill organization_members from existing users table
    op.execute("""
        INSERT INTO organization_members (id, organization_id, user_id, role, status, created_at)
        SELECT gen_random_uuid(), organization_id, id, COALESCE(role, 'owner'), 'active', created_at
        FROM users
        WHERE organization_id IS NOT NULL
        ON CONFLICT (organization_id, user_id) DO NOTHING
    """)


def downgrade() -> None:
    op.drop_index(op.f('ix_organization_members_user_id'), table_name='organization_members')
    op.drop_index(op.f('ix_organization_members_organization_id'), table_name='organization_members')
    op.drop_table('organization_members')
    op.drop_column('users', 'full_name')
    op.drop_index(op.f('ix_organizations_invite_code'), table_name='organizations')
    op.drop_column('organizations', 'invite_code')
