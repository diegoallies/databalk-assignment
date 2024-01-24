// pages/cases/[id].tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  TextField,
  PrimaryButton,
  DefaultButton,
  Stack,
} from '@fluentui/react';
import { mergeStyles } from '@fluentui/react/lib/Styling';

const containerClassName = mergeStyles({
  padding: '20px',
  margin: '0 auto',
  maxWidth: '900px',
});

interface SupportCaseAndComments {
  id: number;
  title: string;
  description: string;
  status: string;
  created_at: string;
  comments: Comment[];
}

interface Comment {
  id: number;
  content: string;
  supportCaseId: number;
  created_at: string;
}

const CaseDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const [caseDetails, setCaseDetails] = useState<SupportCaseAndComments | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCaseDetails = async () => {
      // Skip fetching if `id` is not yet available
      if (!id || Array.isArray(id)) {
        return;
      }
      setIsLoading(true);
      try {
        // Fetch case details and comments using the `id`
        const res = await fetch(`/api/cases/${id}`);
        if (!res.ok) throw new Error(`Error fetching case details: ${res.statusText}`);
        const caseDataAndComments = await res.json();
        setCaseDetails(caseDataAndComments);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
  
    // Call fetchCaseDetails if `id` is defined
    if (id && typeof id === 'string') {
      fetchCaseDetails();
    }
  }, [id]); // Add `id` to the dependency array so the effect re-runs when `id` becomes defined

  const handleEditCase = async () => {
    if (!caseDetails) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/cases/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(caseDetails),
      });

      if (!response.ok) throw new Error('Error updating case.');
      alert('Case updated successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCase = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/cases/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Error deleting case.');
      alert('Case deleted successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={containerClassName}>
      <Stack tokens={{ childrenGap: 15 }}>
        <PrimaryButton text="Back to Dashboard" onClick={() => router.push('/dashboard')} />
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          caseDetails && (
            <>
              <h1>Case Details</h1>
              <TextField label="ID" value={caseDetails.id.toString()} disabled />
              <TextField
                label="Title"
                value={caseDetails.title}
                onChange={(_, newValue) =>
                  setCaseDetails({ ...caseDetails, title: newValue || caseDetails.title })
                }
                disabled={isLoading}
              />
              <TextField
                label="Description"
                value={caseDetails.description}
                onChange={(_, newValue) =>
                  setCaseDetails({ ...caseDetails, description: newValue || caseDetails.description })
                }
                disabled={isLoading}
                multiline
                autoAdjustHeight
              />
              <TextField
                label="Status"
                value={caseDetails.status}
                onChange={(_, newValue) =>
                  setCaseDetails({ ...caseDetails, status: newValue || caseDetails.status })
                }
                disabled={isLoading}
              />
              <TextField
                label="Creation Date"
                value={caseDetails.created_at}
                disabled={true}
              />
              <Stack horizontal tokens={{ childrenGap: 10 }}>
                <DefaultButton text="Edit" onClick={handleEditCase} disabled={isLoading} />
                <DefaultButton text="Delete" onClick={handleDeleteCase} disabled={isLoading} />
              </Stack>
              <h2>Comments</h2>
              {caseDetails?.comments.map((comment) => (
              <div key={comment.id}>
                <p>{comment.content}</p>
                <span>{comment.created_at}</span>
                </div>
              ))}
            </>
          )
        )}
      </Stack>
    </div>
  );
};

export default CaseDetails;