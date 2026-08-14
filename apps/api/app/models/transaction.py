import uuid
from sqlalchemy import Column, String, BigInteger, Numeric, Date, Text, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.db import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    vendor_id = Column(UUID(as_uuid=True), ForeignKey("vendors.id", ondelete="SET NULL"), nullable=True)
    vendor_raw = Column(Text, nullable=True)
    amount_cents = Column(BigInteger, nullable=False)
    currency = Column(String(3), nullable=False, default="USD")
    transaction_date = Column(Date, nullable=False, index=True)
    description = Column(Text, nullable=True)
    ai_suggested_category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    ai_confidence = Column(Numeric(4, 3), nullable=True)
    final_category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    review_status = Column(Text, nullable=False, default="pending")
    reviewed_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    source = Column(Text, nullable=False, default="csv_import")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    organization = relationship("Organization", back_populates="transactions")
    vendor = relationship("Vendor", back_populates="transactions")
    ai_suggested_category = relationship("Category", foreign_keys=[ai_suggested_category_id], back_populates="ai_transactions")
    final_category = relationship("Category", foreign_keys=[final_category_id], back_populates="final_transactions")
    reviewer = relationship("User", foreign_keys=[reviewed_by], back_populates="reviewed_transactions")
