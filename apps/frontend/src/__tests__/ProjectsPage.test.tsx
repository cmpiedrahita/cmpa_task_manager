import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ProjectsPage from "../pages/ProjectsPage";

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock("../hooks/useProjects", () => ({
  useProjects: () => ({
    data: [
      { id: "1", name: "Proyecto Alpha", description: "Desc", status: "active", owner_id: "u1", owner_name: "Ana" },
      { id: "2", name: "Proyecto Beta", description: "", status: "archived", owner_id: "u2", owner_name: "Luis" },
    ],
    isLoading: false,
  }),
  useCreateProject: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateProject: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteProject: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("../store/authStore", () => ({
  useAuthStore: (selector: (s: { user: { id: string; role: string } }) => unknown) =>
    selector({ user: { id: "u1", role: "member" } }),
}));

vi.mock("../components/ui/Modal", () => ({
  default: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
    open ? <div>{children}</div> : null,
}));

describe("ProjectsPage", () => {
  beforeEach(() => {
    render(<ProjectsPage />);
  });

  it("muestra el título de la página", () => {
    expect(screen.getByText("Proyectos")).toBeInTheDocument();
  });

  it("renderiza los proyectos", () => {
    expect(screen.getByText("Proyecto Alpha")).toBeInTheDocument();
    expect(screen.getByText("Proyecto Beta")).toBeInTheDocument();
  });

  it("muestra el badge de estado activo", () => {
    expect(screen.getByText("Activo")).toBeInTheDocument();
  });

  it("muestra el badge de estado archivado", () => {
    expect(screen.getByText("Archivado")).toBeInTheDocument();
  });

  it("muestra botón de nuevo proyecto", () => {
    expect(screen.getByText("Nuevo proyecto")).toBeInTheDocument();
  });
});
