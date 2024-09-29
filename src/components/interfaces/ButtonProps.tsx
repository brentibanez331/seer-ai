export interface ButtonProps {
    showDelete: boolean,
    onClickAdd: (numberInputs: number, numberOutputs: number) => void,
    onClickChat: () => void,
    modelId: string | null
    // onClickDelete: () => void
}