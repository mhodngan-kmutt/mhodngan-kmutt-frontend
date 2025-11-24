import projectsJson from "../mocks/projects.json";
import projectsOfTheMonthJson from "../mocks/project_of_the_month.json";
const API_BASE_URL = import.meta.env.PUBLIC_API_URL;

// ---------- Interfaces ----------
export interface Category {
  categoryId: string;
  categoryName: string;
}

export interface File {
  fileId: string;
  fileUrl: string;
}

export interface Contributor {
  userId: string;
  username: string;
  fullname: string;
  email: string;
  profileImageUrl: string;
  role: string;
}

export interface Professor {
  userId: string;
  fullname: string;
  email: string;
  profileImageUrl: string;
  position: string;
  department: string;
  faculty: string;
  certificationDate: Date;
}

export interface Project {
  projectId: string;
  title: string;
  badge: string;
  status: string;
  previewImageUrl: string;
  shortDescription: string;
  content: string;
  likeCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  categories: Category[];
  externalLinks: string[];
  files: File[];
  contributors: Contributor[];
  certifiedBy: Professor[];
}

export interface ProjectListResponse {
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    sort: {
      orderBy: string;
      order: string;
    };
  };
  data: Project[];
}

export interface GetProjectsParams {
  q?: string;
  badge?: string;
  status?: string;
  from?: string;
  to?: string;
  contributors?: string;
  orderBy?: 'created_at' | 'updated_at' | 'title' | 'like_count' | 'view_count' | 'monthly_like_count' | 'monthly_view_count' | 'yearly_like_count' | 'yearly_view_count';
  order?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
  include?: string;
  token?: string;
  isMyProject?: boolean;
}

// ---------- Utility ----------
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "");
}

// ---------- API Functions ----------
export async function getProjects(params: GetProjectsParams = {}): Promise<ProjectListResponse> {
  const queryParams = new URLSearchParams();

  if (params.q) queryParams.append('q', params.q);
  if (params.badge) queryParams.append('badge', params.badge);
  if (params.status) queryParams.append('status', params.status);
  if (params.from) queryParams.append('from', params.from);
  if (params.to) queryParams.append('to', params.to);
  if (params.contributors) queryParams.append('contributors', params.contributors);
  queryParams.append('orderBy', params.orderBy || 'updated_at');
  queryParams.append('order', params.order || 'desc');
  queryParams.append('page', (params.page || 1).toString());
  queryParams.append('pageSize', (params.pageSize || 100).toString());
  if (params.include) queryParams.append('include', params.include);

  const headers: HeadersInit = {};
  if (params.token) {
    headers['Authorization'] = `Bearer ${params.token}`;
  }

  const endpoint = params.isMyProject ? '/project/me' : '/project';

  const response = await fetch(`${API_BASE_URL}${endpoint}?${queryParams.toString()}`, {
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch projects: ${response.status} ${response.statusText}`);
  }
  
  const result = await response.json();
  // console.log('Fetch Projects Response:', result);
  return {
    meta: result.meta,
    data: result.data,
  };
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

export async function deleteProject(id: string, token: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/project/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete project: ${response.status} ${response.statusText}`);
  }
}

export async function getCurrentUser(token: string): Promise<Contributor> {
  const response = await fetch(`${API_BASE_URL}/user/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.status} ${response.statusText}`);
  }

  const data: Contributor = await response.json();
  return data;
}

export async function recordProjectView(user_id: string, project_id: string) {
  const response = await fetch(`${API_BASE_URL}/view/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id,
      project_id,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to log project view: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}