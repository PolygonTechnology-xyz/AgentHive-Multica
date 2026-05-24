const RoleBadge = ({ role }) => (
  <div className={`role-badge role-badge-${role}`}>
    <span className="role-badge-dot" />
    {role === 'buyer' ? 'BUYER ACCOUNT' : 'FREELANCER ACCOUNT'}
  </div>
);

export default RoleBadge;
