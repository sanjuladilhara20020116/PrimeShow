const BlurCircle = ({
  top = "auto",
  left = "auto",
  right = "auto",
  bottom = "auto",
}) => {
  return (
    <div
      className="absolute -z-10 h-56 w-56 rounded-full bg-primary/30 blur-3xl pointer-events-none"
      style={{ top, left, right, bottom }}
    />
  );
};

export default BlurCircle;
