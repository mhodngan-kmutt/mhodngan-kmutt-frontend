import projectsJson from "../mocks/projects.json";
import projectsOfTheMonthJson from "../mocks/project_of_the_month.json";
import { getSession } from "./auth";

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

// ---------- API Configuration ----------
const API_BASE_URL = import.meta.env.PUBLIC_API_URL;

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

// Fetch single project by ID from backend
export async function getProjectById(id: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/project/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch project: ${response.status}`);
    }
    
    const project = await response.json();
    
    // Ensure slug exists
    if (!project.slug) {
      project.slug = generateSlug(project.title);
    }
    
    return project;
    
  } catch (error) {
    console.error(`Error fetching project ${id}:`, error);
  }
}

// Fetch certification info. by project Id
export async function getCertifyByProjectId(id: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/projects/${id}/certifications`);

    if (!response.ok) {
      throw new Error(`Failed to fetch certification info: ${response.status}`);
    }

    const certification = await response.json();
    
    return certification;

  } catch (error) {
    console.error(`Error fetching certification info. of project ${id}:`, error);
  }
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

// User Profile
export async function getMyProfile() {
  try {
    // Get current session
    const session = await getSession();

    if (!session?.user) {
      console.log('No authenticated user found');
      return null;
    }

    // Get my profile, include passing authorization header
    const response = await fetch(`${API_BASE_URL}/user/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      credentials: 'include',
    });

    if(!response.ok){
      if (response.status === 401) {
        console.log('User not authenticated');
        return null;
      }
      throw new Error(`Failed to fetch my profile: ${response.status} ${response.statusText}`);
    }

    const user = await response.json();
    return user;
    
  } catch (error) {
    console.error(`Error fetching my profile`, error);
    return null;
  }
  
}
