import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ProjectDetailPage from "../pages/ProjectDetailPage";

vi.mock("react-router-dom", () => ({
  useParams: () => ({ id: "project-1" }),
}));

vi.mock("../hooks/useProjects", () => ({
  useProject: () => ({ data: { id: "project-1", name: "Mi Proyecto", description: "Descripción" } }),
}));

vi.mock("../hooks/useTasks", () => ({
  useTasks: () => ({
    data: [
      { id: "t1", title: "Tarea uno", status: "todo", priority: "high", assignee_name: null, due_date: null },
      { id: "t2", title: "Tarea dos", status: "in_progress", priority: "low", assignee_name: "Ana", due_date: null },
    ],
  }),
  useCreateTask: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteTask: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("../hooks/useComments", () => ({
  useComments: () => ({ data: [] }),
  useCreateComment: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteComment: () => ({ mutate: vi.fn() }),
}));

vi.mock("../store/authStore", () => ({
  useAuthStore: (selector: (s: { user: { id: string; role: string } }) => unknown) =>
    selector({ user: { id: "u1", role: "member" } }),
}));

vi.mock("../lib/axios", () => ({
  default: { patch: vi.fn().mockResolvedValue({}) },
}));

vi.mock("../components/ui/Modal", () => ({
  default: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
    open ? <div>{children}</div> : null,
}));

vi.mock("@hello-pangea/dnd", () => ({
  DragDropContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Droppable: ({ children }: { children: (p: object, s: object) => React.ReactNode }) =>
    children({ innerRef: vi.fn(), droppableProps: {}, placeholder: null }, { isDraggingOver: false }),
  Draggable: ({ children }: { children: (p: object, s: object) => React.ReactNode }) =>
    children({ innerRef: vi.fn(), draggableProps: {}, dragHandleProps: {} }, { isDragging: false }),
}));

describe("ProjectDetailPage", () => {
  it("muestra el nombre del proyecto", () => {
    render(<ProjectDetailPage />);
    expect(screen.getByText("Mi Proyecto")).toBeInTheDocument();
  });

  it("renderiza las tareas en el board", () => {
    render(<ProjectDetailPage />);
    expect(screen.getByText("Tarea uno")).toBeInTheDocument();
    expect(screen.getByText("Tarea dos")).toBeInTheDocument();
  });

  it("muestra el botón de nueva tarea", () => {
    render(<ProjectDetailPage />);
    expect(screen.getByText("Nueva tarea")).toBeInTheDocument();
  });

  it("muestra las columnas del kanban", () => {
    render(<ProjectDetailPage />);
    expect(screen.getByText("Por hacer")).toBeInTheDocument();
    expect(screen.getByText("En progreso")).toBeInTheDocument();
  });
});
