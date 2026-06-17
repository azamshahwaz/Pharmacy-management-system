export default function SectionCard({
  title,
  subtitle,
  children,
  action,
}) {

  return (
    <div
      className="
        bg-white
        border border-gray-200
        rounded-3xl
        shadow-sm
        p-4
        transition
        hover:shadow-md
      "
    >

      {/* Header */}
      {(title || subtitle || action) && (

        <div
          className="
            flex
            flex-col
            md:flex-row
            md:items-start
            md:justify-between
            gap-2
            mb-0
          "
        >

          <div>

            {title && (
              <h2
                className="
                  text-xl
                  font-bold
                  text-gray-900
                "
              >
                {title}
              </h2>
            )}

            {subtitle && (
              <p
                className="
                  text-sm
                  text-gray-500
                  mt-1
                "
              >
                {subtitle}
              </p>
            )}

          </div>

          {action && (
            <div>
              {action}
            </div>
          )}

        </div>
      )}

      {/* Content */}
      <div>
        {children}
      </div>

    </div>
  );
}