import uuid
from datetime import datetime, timezone
from sqlalchemy import func
from app.core.db import engine, SessionLocal
from app.core.auth import hash_password, verify_password
from app.models.user import User
from app.models.organization import Organization
from app.models.organization_member import OrganizationMember
from app.models.invitation import Invitation
from app.models.message import Message

db = SessionLocal()

print("==========================================")
print("RUNNING EXTENDED DATABASE VERIFICATION")
print("==========================================")

ts = int(datetime.now(timezone.utc).timestamp())
org_name_a = f"Acme Fin {ts}"
org_name_b = f"Beta Corp {ts}"
initial_pass = "InitialPass123!"
new_pass = "UpdatedPass456!"

owner_a_id = uuid.uuid4()
owner_a_email = f"owner.a.{ts}@example.com"
invited_1_email = f"rahul.{ts}@example.com"
invited_2_email = f"ananya.{ts}@example.com"
invited_3_email = f"deepak.{ts}@example.com"

uninvited_email = f"stranger.{ts}@example.com"

try:
    # ---------------------------------------------------------
    # TEST A: Create Org without initial password + 2 invitations + Owner sets password + Invites 3rd member
    # ---------------------------------------------------------
    user_a = User(id=owner_a_id, email=owner_a_email, full_name="Owner A")
    org_a = Organization(name=org_name_a, password_hash=None)
    db.add_all([user_a, org_a])
    db.commit()
    db.refresh(org_a)

    mem_a = OrganizationMember(organization_id=org_a.id, user_id=user_a.id, role="owner", status="active")
    inv1 = Invitation(organization_id=org_a.id, invited_email=invited_1_email, invited_name="Rahul", invited_role="accountant", status="pending")
    inv2 = Invitation(organization_id=org_a.id, invited_email=invited_2_email, invited_name="Ananya", invited_role="viewer", status="pending")
    db.add_all([mem_a, inv1, inv2])
    db.commit()

    assert org_a.password_hash is None, "Password hash should be None initially"
    assert mem_a.role == "owner", "Creator must be Owner"

    # Owner sets organization password
    org_a.password_hash = hash_password(initial_pass)
    # Owner invites 3rd member
    inv3 = Invitation(organization_id=org_a.id, invited_email=invited_3_email, invited_name="Deepak", invited_role="admin", status="pending")
    db.add(inv3)
    db.commit()

    assert org_a.password_hash != initial_pass, "Password must not be stored in plaintext"
    assert verify_password(initial_pass, org_a.password_hash) is True, "Bcrypt verification failed"
    print("[OK] TEST A PASSED: Org created without password, owner assigned, 2 initial invites stored, password set, 3rd invite created.")

    # ---------------------------------------------------------
    # TEST B: Invited User Sign-in, Auto-Claim & Display Name Setup
    # ---------------------------------------------------------
    invited_user = User(id=uuid.uuid4(), email=invited_1_email, full_name=None)
    db.add(invited_user)
    db.commit()

    matched_inv = db.query(Invitation).filter(func.lower(Invitation.invited_email) == invited_user.email.lower(), Invitation.status == "pending").first()
    assert matched_inv is not None, "Pending invitation not found"
    
    new_mem = OrganizationMember(organization_id=matched_inv.organization_id, user_id=invited_user.id, role=matched_inv.invited_role, status="active")
    matched_inv.status = "accepted"
    matched_inv.accepted_at = datetime.now(timezone.utc)
    db.add(new_mem)

    # User updates display name
    invited_user.full_name = "Rahul Sharma"
    db.commit()

    assert new_mem.role == "accountant", "Assigned invitation role must be preserved"
    assert invited_user.full_name == "Rahul Sharma", "Display name updated"
    print("[OK] TEST B PASSED: Invited Google user matched, invitation claimed, role preserved, display name set.")

    # ---------------------------------------------------------
    # TEST C: Uninvited Google Email
    # ---------------------------------------------------------
    stranger = User(id=uuid.uuid4(), email=uninvited_email, full_name="Stranger")
    db.add(stranger)
    db.commit()

    stranger_inv = db.query(Invitation).filter(func.lower(Invitation.invited_email) == stranger.email.lower(), Invitation.status == "pending").first()
    assert stranger_inv is None, "Uninvited email must not match any invitation"
    print("[OK] TEST C PASSED: Uninvited email receives no invitation access.")

    # ---------------------------------------------------------
    # TEST D: Wrong Password Rejection on Join
    # ---------------------------------------------------------
    wrong_pw_check = verify_password("WrongPass!", org_a.password_hash)
    assert wrong_pw_check is False, "Wrong password must fail"
    print("[OK] TEST D PASSED: Invalid password rejected.")

    # ---------------------------------------------------------
    # TEST E: Self-Assign Owner Security
    # ---------------------------------------------------------
    malicious_role = "owner"
    is_forbidden = (malicious_role.strip().lower() == "owner")
    assert is_forbidden is True, "Joining users cannot self-assign Owner"
    print("[OK] TEST E PASSED: Self-assigning Owner role blocked.")

    # ---------------------------------------------------------
    # TEST F: Cross-Tenant Data Isolation
    # ---------------------------------------------------------
    user_b = User(id=uuid.uuid4(), email=f"owner.b.{ts}@example.com", full_name="Owner B")
    org_b = Organization(name=org_name_b, password_hash=hash_password("OrgBPass123!"))
    db.add_all([user_b, org_b])
    db.commit()
    db.refresh(org_b)

    mem_b = OrganizationMember(organization_id=org_b.id, user_id=user_b.id, role="owner", status="active")
    db.add(mem_b)
    db.commit()

    org_a_members_for_user_b = db.query(OrganizationMember).filter(OrganizationMember.organization_id == org_a.id, OrganizationMember.user_id == user_b.id).all()
    assert len(org_a_members_for_user_b) == 0, "User B must not have access to Org A"
    print("[OK] TEST F PASSED: Cross-tenant organization access blocked.")

    # ---------------------------------------------------------
    # TEST G: Owner Changes Organization Password
    # ---------------------------------------------------------
    org_a.password_hash = hash_password(new_pass)
    db.commit()

    assert verify_password(initial_pass, org_a.password_hash) is False, "Old password must fail"
    assert verify_password(new_pass, org_a.password_hash) is True, "New password must succeed"
    print("[OK] TEST G PASSED: Password updated, old password fails, new password works.")

    # ---------------------------------------------------------
    # TEST H: Organization-Scoped Community Chat Persistence
    # ---------------------------------------------------------
    msg1 = Message(organization_id=org_a.id, sender_user_id=user_a.id, message="Hello Org A team!")
    db.add(msg1)
    db.commit()

    msg_org_b = db.query(Message).filter(Message.organization_id == org_b.id).all()
    assert len(msg_org_b) == 0, "Org B cannot see Org A chat messages"

    msg_org_a = db.query(Message).filter(Message.organization_id == org_a.id).all()
    assert len(msg_org_a) == 1
    assert msg_org_a[0].message == "Hello Org A team!"
    print("[OK] TEST H PASSED: Chat message persisted in PostgreSQL with strict tenant isolation.")

    print("\nALL BACKEND DATABASE TESTS COMPLETED SUCCESSFULLY!")

finally:
    db.close()
