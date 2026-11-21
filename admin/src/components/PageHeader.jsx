import { Link } from "react-router";
import { Button } from "antd";

const PageHeader = ({
  children,
  pageName,
  isSuccess = false,
  filteredTagsCount = 0,
  isDelete = false,
  deleteFn,
  selectedRows = [],
  btn = false,
  btnHref = "#",
  btnName = "",
  extra = null,
}) => {
  return (
    <div className="bg-white py-2 px-3 rounded shadow flex flex-row items-center justify-between">
      {/* Left side */}
      <div className="flex gap-5 items-center">
        {children}

        <div>
          <span>{pageName}</span>

          {isSuccess && <span> (Jemi {filteredTagsCount} sany)</span>}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {extra}
        {/* Delete selected */}
        {selectedRows.length > 0 && (
          <Button
            danger
            type="primary"
            loading={isDelete}
            disabled={isDelete}
            onClick={deleteFn}
          >
            Delete ({selectedRows.length} selected)
          </Button>
        )}

        {/* Add/Create button */}
        {btn && (
          <Link to={btnHref}>
            <Button type="primary">{btnName}</Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
