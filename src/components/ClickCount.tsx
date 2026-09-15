import { CARD_COUNT_CLASS } from "./cardStyle";

type ClickCountProps = {
  value: number;
};

export default function ClickCount({ value }: ClickCountProps) {
  return (
    <span className={CARD_COUNT_CLASS}>
      {value.toLocaleString("ko-KR")}회
    </span>
  );
}
