import React, { useState } from 'react';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import NoteList from '../NoteList/NoteList';
import Pagination from '../Pagination/Pagination';
import SearchBox from '../SearchBox/SearchBox';
import Modal from '../Modal/Modal';
import NoteForm from '../NoteForm/NoteForm';
import { fetchNotes } from '../../services/noteService';
import css from './App.module.css';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['notes', currentPage, debouncedSearchTerm],
    queryFn: () =>
      fetchNotes({
        page: currentPage,
        perPage: 12,
        search: debouncedSearchTerm,
      }),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  const handlePageChange = (selectedItem: { selected: number }) => {
    setCurrentPage(selectedItem.selected + 1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); 
  };

  const handleCreateNote = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleNoteCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['notes'] });
    setIsModalOpen(false);
  };

  if (error) {
    return (
      <div className={css.app}>
        <div className={css.error}>
          Error loading notes. Please try again later.
        </div>
      </div>
    );
  }

  const notes = data?.notes || [];
  const totalPages = data?.totalPages || 0;

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox value={searchTerm} onChange={handleSearchChange} />
        {totalPages > 1 && (
          <Pagination
            pageCount={totalPages}
            currentPage={currentPage - 1}
            onPageChange={handlePageChange}
          />
        )}
        <button className={css.button} onClick={handleCreateNote}>
          Create note +
        </button>
      </header>

      {isLoading && <div className={css.loading}>Loading notes...</div>}

      {notes.length > 0 && <NoteList notes={notes} />}

      {!isLoading && notes.length === 0 && (
        <div className={css.emptyState}>
          {searchTerm
            ? 'No notes found for your search.'
            : 'No notes yet. Create your first note!'}
        </div>
      )}

      {isModalOpen && (
        <Modal onClose={handleCloseModal}>
          <NoteForm onCancel={handleCloseModal} onSubmit={handleNoteCreated} />
        </Modal>
      )}
    </div>
  );
};

export default App;

