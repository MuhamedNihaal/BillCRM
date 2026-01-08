import { clsx } from "clsx";

const DetailsGrid = ({ data, isChunked = false }) => {
  if (isChunked) {
    const chunked = [];
    data = data.filter((item) => item.label);
    for (let i = 0; i < data.length; i += 4) {
      chunked.push(data.slice(i, i + 4));
    }
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
        {chunked.map((group, colIndex) => (
          <div key={colIndex} className="flex flex-col gap-2">
            {group.map(({ label, value }, index) => (
              <div key={index} className="flex gap-2">
                <span className="">{label}:</span>
                <span className="font-semibold break-all">{value || "--"}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  } else {
    return (
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3 lg:grid-cols-4">
        {data.map(({ label, value, className }, index) => {
          if (!label || !value) return null;
          return (
            <div key={index} className={clsx("flex gap-2", className)}>
              <span className="">{label}:</span>
              <span className="font-semibold break-all">{value}</span>
            </div>
          );
        })}
      </div>
    );
  }
};

export default DetailsGrid;
