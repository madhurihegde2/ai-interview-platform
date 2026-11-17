import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { buttonClasses } from "./buttonClasses";

function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon: Icon,
  className = "",
  type = "button",
  disabled,
  children,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={buttonClasses({ variant, size, className })}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        Icon && <Icon className="h-4 w-4" aria-hidden="true" />
      )}
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  icon: Icon,
  className = "",
  children,
  ...props
}) {
  return (
    <Link className={buttonClasses({ variant, size, className })} {...props}>
      {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
      {children}
    </Link>
  );
}

export default Button;
