// pages/cases/[id].tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  TextField,
  PrimaryButton,
  DefaultButton,
  Stack,
} from '@fluentui/react';

// Define the interface for the case data
interface SupportCase {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
}

const CaseDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const [caseDetails, setCaseDetails] = useState<SupportCase | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const fetchCaseDetails = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const response = await fetch(`/api/cases/${id}`);
        if (response.ok) {
          const data: SupportCase = await response.json();
          setCaseDetails(data);
        } else {
          // Handle error
          console.error('Failed to fetch case details');
        }
      } catch (error) {
        console.error('An error occurred: ', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCaseDetails();
  }, [id]);

  const handleEditCase = async () => {
    if (!caseDetails || !id) return;
  
    const response = await fetch(`/api/cases/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // Use your actual token retrieval method.
        // For example, if using authorization headers:
        // Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        title: caseDetails.title,
        description: caseDetails.description,
        status: caseDetails.status, // Include any other fields that should be updated
      }),
    });
  
    if (response.ok) {
      // Handle the successful update here, for example informing the user and ending edit mode
      setEditMode(false);
    } else {
      // Handle error here, for example informing the user of the error
      console.error('Failed to update case');
    }
  };

  const handleDeleteCase = async () => {
    if (!id) return;

    const response = await fetch(`/api/cases/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        // Add authorization header if necessary
      },
    });

    if (response.ok) {
      router.push('/dashboard'); // Navigate back to the dashboard after deletion
    } else {
      // Handle error
      console.error('Failed to delete case');
    }
  };

  const handleBackClick = () => {
    router.push('/dashboard'); // Navigate back to the dashboard
  };

  return (
    <Stack tokens={{ childrenGap: 15 }} horizontalAlign="start">
      <PrimaryButton text="Back to Dashboard" onClick={handleBackClick} />
      {!isLoading && caseDetails ? (
        <Stack tokens={{ childrenGap: 15 }}>
          <h1>Case Details</h1>
          <TextField readOnly={!editMode} label="ID" value={caseDetails.id} />
          <TextField
            readOnly={!editMode}
            label="Title"
            value={caseDetails.title}
            onChange={(ev, newValue) =>
              setCaseDetails({ ...caseDetails, title: newValue || '' })
            }
          />
          <TextField
            readOnly={!editMode}
            label="Description"
            value={caseDetails.description}
            multiline
            autoAdjustHeight
            onChange={(ev, newValue) =>
              setCaseDetails({ ...caseDetails, description: newValue || '' })
            }
          />
          <TextField readOnly label="Status" value={caseDetails.status} />
          <TextField readOnly label="Creation Date" value={caseDetails.created_at} />
          <Stack horizontal tokens={{ childrenGap: 10 }}>
            <DefaultButton
              text={editMode ? 'Save' : 'Edit'}
              onClick={() => (editMode ? handleEditCase() : setEditMode(true))}
            />
            <DefaultButton
              text="Delete"
              onClick={handleDeleteCase}
              disabled={editMode}
            />
          </Stack>
        </Stack>
      ) : (
        <p>Loading...</p>
      )}
    </Stack>
  );
};

export default CaseDetails;