"""Add organization password_hash, organization_invitations, and organization_messages tables

Revision ID: 003_org_pass_invites_chat
Revises: 002_add_organization_members
Create Date: 2026-08-18T23:50:00.000000+00:00

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '003_org_pass_invites_chat'
down_revision: Union[str, None] = '002_add_organization_members'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add password_hash to organizations table
    op.add_column('organizations', sa.Column('password_hash', sa.String(length=255), nullable=True))

    # 2. Create organization_invitations table
    op.create_table(
        'organization_invitations',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('invited_email', sa.String(length=255), nullable=False),
        sa.Column('invited_name', sa.String(length=255), nullable=False),
        sa.Column('invited_role', sa.String(length=50), nullable=False, server_default='accountant'),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='pending'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('accepted_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_organization_invitations_organization_id'), 'organization_invitations', ['organization_id'], unique=False)
    op.create_index(op.f('ix_organization_invitations_invited_email'), 'organization_invitations', ['invited_email'], unique=False)

    # 3. Create organization_messages table
    op.create_table(
        'organization_messages',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('sender_user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['sender_user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_organization_messages_organization_id'), 'organization_messages', ['organization_id'], unique=False)
    op.create_index(op.f('ix_organization_messages_sender_user_id'), 'organization_messages', ['sender_user_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_organization_messages_sender_user_id'), table_name='organization_messages')
    op.drop_index(op.f('ix_organization_messages_organization_id'), table_name='organization_messages')
    op.drop_table('organization_messages')

    op.drop_index(op.f('ix_organization_invitations_invited_email'), table_name='organization_invitations')
    op.drop_index(op.f('ix_organization_invitations_organization_id'), table_name='organization_invitations')
    op.drop_table('organization_invitations')

    op.drop_column('organizations', 'password_hash')
