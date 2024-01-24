import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  DetailsList,
  IColumn,
  DetailsListLayoutMode,
  SelectionMode,
  TextField,
  PrimaryButton,
  DefaultButton,
  Modal,
} from '@fluentui/react';
import { mergeStyleSets } from '@fluentui/react/lib/Styling';
import { isValid, parseISO, format } from 'date-fns';

const classNames = mergeStyleSets({
  container: {
    margin: 'auto',
    padding: '20px',
    maxWidth: '900px',
  },
  addNewCaseButton: {
    marginTop: '20px',
  },
  modalContainer: {
    padding: '20px',
  },
  modalHeader: {
    marginBottom: '24px',
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
});

interface SupportCase {
  id: number;
  title: string;
  description: string;
  status: string;
  created_at: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [supportCases, setSupportCases] = useState<SupportCase[]>([]);
  const [newCaseTitle, setNewCaseTitle] = useState('');
  const [newCaseDescription, setNewCaseDescription] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSupportCases = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must log in to view this page.');
        router.push('/login');
        return;
      }

      try {
        const response = await fetch('/api/cases', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch support cases.');
        }

        const data = await response.json();
        setSupportCases(data.cases);
      } catch (err) {
        setError(err.message || 'Failed to load support cases.');
      }
    };

    fetchSupportCases();
  }, [router]);

  const columns: IColumn[] = [
    { key: 'column1', name: 'Title', fieldName: 'title', minWidth: 100, maxWidth: 200, isResizable: true },
    { key: 'column2', name: 'Status', fieldName: 'status', minWidth: 50, maxWidth: 100, isResizable: true },
    {
      key: 'column3',
      name: 'Creation Date',
      fieldName: 'created_at',
      minWidth: 100,
      maxWidth: 200,
      isResizable: true,
      onRender: (item: SupportCase) => {
        // Check if created_at is a valid string, then parse and format
        if (item.created_at) {
          const date = parseISO(item.created_at);
          return <span>{isValid(date) ? format(date, 'PPP p') : 'Invalid date'}</span>;
        } else {
          return <span>Unknown date</span>; // or some placeholder if the date is undefined
        }
      },
    },
  ];

  const handleCreateCase = async () => {
    setError('');
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must log in to create a case.');
      return;
    }

    try {
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newCaseTitle,
          description: newCaseDescription,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create a case.');
      }

      const data = await response.json();
      setSupportCases([...supportCases, {
        id: data.caseId,
        title: newCaseTitle,
        description: newCaseDescription,
        status: 'Open', // Assuming new cases default to 'Open' status
        created_at: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
      }]);
      setNewCaseTitle('');
      setNewCaseDescription('');
      setIsModalOpen(false); // Close the modal upon successful creation
    } catch (err) {
      setError(err.message || 'Failed to create case.');
    }
  };

  return (
    <div className={classNames.container}>
      <h1>Support Case Dashboard</h1>
      {error && <p className="error">{error}</p>}
      
      <DefaultButton 
        text="Add New Case"
        onClick={() => setIsModalOpen(true)}
        className={classNames.addNewCaseButton}
      />

      <Modal
        titleAriaId="Create Case"
        isOpen={isModalOpen}
        onDismiss={() => setIsModalOpen(false)}
        isBlocking={false}
        containerClassName={classNames.modalContainer}
      >
        <div className={classNames.modalHeader}>
          <h2>Create New Case</h2>
        </div>
        <div className={classNames.formContainer}>
          <TextField
            label="Case Title"
            value={newCaseTitle}
            onChange={(_, value) => setNewCaseTitle(value || '')}
          />
          <TextField
            label="Case Description"
            value={newCaseDescription}
            multiline
            rows={3}
            onChange={(_, value) => setNewCaseDescription(value || '')}
          />
          <PrimaryButton 
            text="Create Case" 
            onClick={handleCreateCase}
          />
        </div>
      </Modal>
      
      <DetailsList
        items={supportCases}
        columns={columns}
        setKey="set"
        layoutMode={DetailsListLayoutMode.fixedColumns}
        selectionMode={SelectionMode.none}
      />
    </div>
  );
}