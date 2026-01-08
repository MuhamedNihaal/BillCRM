const CustomBadge = ({ title, color }) => (
  <div
    className="badge-base badge border"
    style={{
      color: `${color}`,
      backgroundColor: `${color}10`,
      borderColor: `${color}40`,
    }}
  >
    {title}
  </div>
);

export default CustomBadge;
