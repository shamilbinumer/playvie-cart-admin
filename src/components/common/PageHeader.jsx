
export const PageHeader = ({
  title,
  description,
  actionButton,
  children,
  className = ""
}) => {
  return (
    <div className={`my-4 px-2 flex justify-between items-center ${className}`}>
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        {description && (
          <p className="text-gray-600">{description}</p>
        )}
      </div>
      <div>
        {actionButton}
        {children}
      </div>
    </div>
  );
};