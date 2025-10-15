import projectsJson from "../mocks/projects.json";
import projectsOfTheMonthJson from "../mocks/project_of_the_month.json";

// ---------- Interfaces ----------
export interface Contributor {
  name: string;
  role: string;
  avatar: string;
}

export interface Professor {
  name: string;
  avatar: string;
}

export interface Project {
  id: number;
  slug: string;
  title: string;
  description: string;
  image: string;
  link: string;
  views: number;
  likes: number;
  team: string;
  Contributor: Contributor[];
  Professors: Professor[];
}

// ---------- Utility ----------
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "");
}

// ---------- Prepare Data ----------
const projects: Project[] = projectsJson.list.map((project) => ({
  ...project,
  slug: generateSlug(project.title),
}));

const projectsOfTheMonth: Project[] = projectsOfTheMonthJson.list.map((project) => ({
  ...project,
  slug: generateSlug(project.title),
}));

// ---------- API Functions ----------
export async function getProjects(): Promise<Project[]> {
  await new Promise((r) => setTimeout(r, 100));
  return projects;
}

export async function getProjectBySlug(slug: string): Promise<Project> {
  await new Promise((r) => setTimeout(r, 100));
  const project = [...projects, ...projectsOfTheMonth].find((p) => p.slug === slug);
  if (!project) throw new Error(`Project not found: ${slug}`);
  return project;
}

export async function getProjectsOfTheMonth(): Promise<Project[]> {
  await new Promise((r) => setTimeout(r, 100));
  return projectsOfTheMonth;
}
