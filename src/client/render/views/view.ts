export interface View {
    enter(): void;
    exit(): void;
    resize(width: number, height: number): void;
    render(): void;
}