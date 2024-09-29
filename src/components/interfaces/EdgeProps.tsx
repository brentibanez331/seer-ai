export interface EdgeProps {
    selected: boolean;
    isNew: boolean;
    position: {
        x0: number,
        y0: number,
        x1: number,
        y1: number
    }
    onMouseDownEdge: () => void
    onClickDeleteEdge: () => void
}