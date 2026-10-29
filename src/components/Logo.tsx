interface Props {
  light?: boolean; // for dark backgrounds
  large?: boolean; // the public header
}

export default function Logo({ light = false, large = false }: Props) {
  return (
    <div className="flex items-center gap-3">
      <img src="/caa-globe.jpg" alt=""
        className={`shrink-0 rounded-full bg-white object-cover ${large ? "h-11 w-11" : "h-9 w-9"}`} />
      <span className={`font-display font-bold leading-tight tracking-wider ${large ? "text-lg sm:text-xl" : "text-sm"} ${
        light ? "text-white" : "text-royal"
      }`}>
        CYBER ASCEND AFRICA
      </span>
    </div>
  );
}