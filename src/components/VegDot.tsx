export default function VegDot({ veg }: { veg: boolean }) {
  return (
    <span
      className="inline-flex h-3.5 w-3.5 items-center justify-center border"
      style={{ borderColor: veg ? "var(--veg)" : "var(--nonveg)" }}
      title={veg ? "Veg" : "Non-veg"}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: veg ? "var(--veg)" : "var(--nonveg)" }}
      />
    </span>
  );
}
