import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.db import Base


class Invitation(Base):
    __tablename__ = "organization_invitations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    invited_email = Column(String(255), nullable=False, index=True)
    invited_name = Column(String(255), nullable=False)
    invited_role = Column(String(50), nullable=False, default="accountant")  # admin | accountant | viewer
    status = Column(String(50), nullable=False, default="pending")  # pending | accepted | revoked
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    accepted_at = Column(DateTime(timezone=True), nullable=True)

    organization = relationship("Organization", back_populates="invitations")
