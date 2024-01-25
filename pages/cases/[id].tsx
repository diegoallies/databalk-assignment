// pages/cases/[id].tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  TextField,
  PrimaryButton,
  DefaultButton,
  Stack,
  Text,
} from '@fluentui/react';
import { mergeStyles } from '@fluentui/react/lib/Styling';
import { IStackStyles } from '../../node_modules/@fluentui/react/lib/Stack';
import { ITextFieldStyles } from '../../node_modules/@fluentui/react/lib/TextField';

// Define styles outside of the component
const textFieldStyles: Partial<ITextFieldStyles> = { fieldGroup: { width: '100%' } };
const columnStackStyles: IStackStyles = { root: { width: '100%', maxWidth: '50%' } };
const commentsSectionStyle: React.CSSProperties = { marginTop: '20px' };
const commentBoxStyle: React.CSSProperties = {
  marginTop: '10px',
  padding: '10px',
  border: '1px solid #cccccc',
  borderRadius: '4px',
  background: '#f3f2f1',
};

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
  user_name: string; // Ensure that user_name is part of the Comment interface
  case_id: number;
  created_at: string;
}
const CaseDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const [caseDetails, setCaseDetails] = useState<SupportCaseAndComments | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState(''); // Correctly defined state setter


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

  const handleAddComment = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
  
    // Retrieve `user_id` and `user_name` from localStorage and include them in the POST request
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
  
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include your Bearer token here if authentication is required
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          case_id: id, // Ensure `id` is a number, not a string
          user_id: userId,
          user_name: userName,
          content: newComment,
        }),
      });
  
      if (response.ok) {
        const addedComment = await response.json();
        setComments([...comments, addedComment]);
        setNewComment('');
        alert('Comment added successfully!');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'An error occurred while posting the comment.');
      }
    } catch (error) {
      console.error(error);
      setError('An error occurred while posting the comment.');
    } finally {
      setIsLoading(false);
    }
    
  };


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
    <Stack tokens={{ childrenGap: 15 }} styles={{ root: { padding: '20px', margin: '0 auto', maxWidth: '900px' } }}>
      <PrimaryButton text="Back to Dashboard" onClick={() => router.push('/dashboard')} />

      {isLoading ? <Text>Loading...</Text> : (
        caseDetails && (
          <>
            <Stack horizontal tokens={{ childrenGap: 50 }} styles={{ root: { width: '100%' } }}>
              {/* Left column for editable fields */}
              <Stack tokens={{ childrenGap: 15 }} styles={columnStackStyles}>
                <TextField
                  label="Title"
                  styles={textFieldStyles}
                  value={caseDetails.title}
                  onChange={(_, newValue) =>
                    setCaseDetails({ ...caseDetails, title: newValue || caseDetails.title })
                  }
                  disabled={isLoading}
                />
                <TextField
                  label="Description"
                  styles={textFieldStyles}
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
                  styles={textFieldStyles}
                  value={caseDetails.status}
                  onChange={(_, newValue) =>
                    setCaseDetails({ ...caseDetails, status: newValue || caseDetails.status })
                  }
                  disabled={isLoading}
                />
                <Stack horizontal tokens={{ childrenGap: 10 }}>
                  <DefaultButton text="Edit" onClick={handleEditCase} disabled={isLoading} />
                  <DefaultButton text="Delete" onClick={handleDeleteCase} disabled={isLoading} />
                </Stack>
              </Stack>

              {/* Right column for unchangeable fields */}
              <Stack tokens={{ childrenGap: 15 }} styles={columnStackStyles}>
                <TextField label="Case ID" styles={textFieldStyles} value={caseDetails.id.toString()} disabled />
                <TextField
                  label="Creation Date"
                  styles={textFieldStyles}
                  value={new Date(caseDetails.created_at).toLocaleString()}
                  disabled
                />
              </Stack>
            </Stack>

            <Stack styles={{ root: commentsSectionStyle }}>
              <Text variant="large" styles={{ root: { marginBottom: '10px' } }}>Comments</Text>
              <form onSubmit={handleAddComment}>
                <Stack tokens={{ childrenGap: 5 }}>
                  <TextField
                    label="New Comment"
                    multiline
                    autoAdjustHeight
                    value={newComment}
                    onChange={(_, newValue) => setNewComment(newValue || '')}
                    disabled={isLoading}
                  />
                  <PrimaryButton text="Add Comment" type="submit" disabled={isLoading || !newComment.trim()} />
                </Stack>
              </form>
              {caseDetails.comments.map((comment) => (
                <div key={comment.id} style={commentBoxStyle}>
                  <Text variant="smallPlus"><strong>{comment.user_name}:</strong> {comment.content}</Text>
                  <br />
                  <Text variant="small" styles={{ root: { color: '#777777', fontSize: '10px' } }}>{new Date(comment.created_at).toLocaleString()}</Text>
                </div>
              ))}
            </Stack>
          </>
        )
      )}
    </Stack>
  );
};

export default CaseDetails;