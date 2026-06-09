export default function MemberAvatar({ name, initials, role, size = 'md', onClick }) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
  };

  const roleColors = {
    CHAIRPERSON: 'from-terracotta-400 to-clay-600',
    TREASURER: 'from-slate-600 to-slate-800',
    SECRETARY: 'from-sand-400 to-sand-600',
    LOAN_OFFICER: 'from-success-500 to-success-700',
    MEMBER: 'from-slate-400 to-slate-600',
  };

  const gradient = roleColors[role] || roleColors.MEMBER;

  return (
    <div
      onClick={onClick}
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-heading font-bold ${onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
      title={name}
    >
      {initials || name?.charAt(0)?.toUpperCase() || '?'}
    </div>
  );
}