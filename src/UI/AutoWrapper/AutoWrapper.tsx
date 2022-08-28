import { ReactElement } from "react";
import "./AutoWrapper.css";

const AutoWrapper = ({
  children,
  className,
  onClick,
}: {
  children: ReactElement;
  className?: string;
  onClick?: () => void;
}) => {
  return (
    <div className={`autoWrapper_wrap ${className ? className : ``}`}>
      <div onClick={onClick ? onClick : () => {}} className="inner">
        {children}
      </div>
    </div>
  );
};

export default AutoWrapper;
