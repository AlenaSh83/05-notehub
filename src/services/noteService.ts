import axios from 'axios';
import type { Note, CreateNoteParams } from '../types/note';

const BASE_URL = 'https://notehub-public.goit.study/api/notes';


const TOKEN = import.meta.env.VITE_NOTEHUB_TOKEN;


const getAuthHeader = () => ({
  Authorization: `Bearer ${TOKEN}`,
});

interface FetchNotesParams {
  page?: number;
  perPage?: number;
  search?: string;
}

interface NotesApiResponse {
  data: Note[];
  meta: {
    totalPages: number;
    currentPage: number;
    perPage: number;
    total: number;
  };
}


export const fetchNotes = async (
  params: FetchNotesParams = {}
): Promise<NotesApiResponse> => {
  const { page = 1, perPage = 12, search = '' } = params;
  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('perPage', perPage.toString());
  if (search) {
    queryParams.append('search', search);
  }

  const response = await axios.get<NotesApiResponse>(
    `${BASE_URL}?${queryParams.toString()}`,
    {
      headers: getAuthHeader(), 
    }
  );
  return response.data;
};

// ✅ Створити нотатку
export const createNote = async (note: CreateNoteParams): Promise<Note> => {
  const response = await axios.post<Note>(`${BASE_URL}`, note, {
    headers: getAuthHeader(), 
  });
  return response.data;
};

// ✅ Видалити нотатку
export const deleteNote = async (id: string): Promise<void> => {
  await axios.delete(`${BASE_URL}/${id}`, {
    headers: getAuthHeader(), 
  });
};

const noteService = {
  fetchNotes,
  createNote,
  deleteNote,
};

export default noteService;


