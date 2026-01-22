import type { ObjectValues } from "../../types/common";

const SpinnerSize = {
    SM: 'sm',
    MD: 'md',
} as const;

export type SpinnerSize = ObjectValues<typeof SpinnerSize>;