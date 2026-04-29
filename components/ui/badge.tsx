export function Badge({
  children,
  variant = "default",
  className = "",
}: {
  children: React.ReactNode;
  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "destructive"
    | "success"
    | "warning";
  className?: string;
}) {
  const variants = {
    default: "bg-[#2a2f35] text-white",
    secondary: "bg-[#f4f6f8] text-[#2a2f35] border border-[#d5d8db]",
    outline: "border border-[#d5d8db] text-[#2a2f35]",
    destructive: "bg-red-100 text-red-900",
    success: "bg-green-100 text-green-900",
    warning: "bg-amber-100 text-amber-900",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
