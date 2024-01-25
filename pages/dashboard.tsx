import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { DetailsList, IColumn, DetailsListLayoutMode, SelectionMode, TextField, PrimaryButton, Modal } from '@fluentui/react';
import { mergeStyleSets } from '@fluentui/react/lib/Styling';

const classNames = mergeStyleSets({
    container: { margin: 'auto', padding: '20px', maxWidth: '900px' },
    modalContainer: { padding: '20px' }
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
            if (!token) return router.push('/login');
            
            const response = await fetch('/api/cases', { headers: { Authorization: `Bearer ${token}` } });
            const data = await response.json();
            response.ok ? setSupportCases(data.cases) : setError(data.message || 'Failed to load support cases.');
        };
        fetchSupportCases();
    }, [router]);

    const columns: IColumn[] = [
        {
            key: 'title', name: 'Title', fieldName: 'title', minWidth: 100, maxWidth: 200, isResizable: true,
            onRender: (item: SupportCase) => <a style={{ cursor: 'pointer' }} onClick={() => router.push(`/cases/${item.id}`)}>{item.title}</a>
        },
        { key: 'status', name: 'Status', fieldName: 'status', minWidth: 50, maxWidth: 100, isResizable: true,
        onRender: (item: SupportCase) => <a style={{ cursor: 'pointer' }} onClick={() => router.push(`/cases/${item.id}`)}>{item.status}</a> },
        { key: 'created_at', name: 'Creation Date', fieldName: 'created_at', minWidth: 100, maxWidth: 200, isResizable: true,
        onRender: (item: SupportCase) => <a style={{ cursor: 'pointer' }} onClick={() => router.push(`/cases/${item.id}`)}>{item.created_at}</a> }

    ];

    const handleCreateCase = async () => {
        const token = localStorage.getItem('token');
        if (!token) return setError('You must log in to create a case.');

        const response = await fetch('/api/cases', {
            method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ title: newCaseTitle, description: newCaseDescription })
        });

        if (response.ok) {
            const data = await response.json();
            setSupportCases([...supportCases, {...data, title: newCaseTitle, description: newCaseDescription, status: 'Open'}]);
            setIsModalOpen(false); setNewCaseTitle(''); setNewCaseDescription('');
        } else {
            setError('Failed to create case.');
        }
    };

    return (
        <div className={classNames.container}>
            <h1>Support Case Dashboard</h1>
            {error && <p>{error}</p>}
            <Modal titleAriaId="Create Case" isOpen={isModalOpen} onDismiss={() => setIsModalOpen(false)} isBlocking={false} className={classNames.modalContainer}>
                <div className="modal1"><h2>Create New Case</h2>
                <TextField label="Case Title" value={newCaseTitle} onChange={(_, value) => setNewCaseTitle(value || '')} />
                <TextField label="Case Description" multiline rows={3} value={newCaseDescription} onChange={(_, value) => setNewCaseDescription(value || '')} />
                <br />
                <PrimaryButton text="Create Case" onClick={handleCreateCase} /></div>
                
            </Modal>
            <DetailsList items={supportCases} columns={columns} setKey="set" layoutMode={DetailsListLayoutMode.fixedColumns} selectionMode={SelectionMode.none} />
            <br></br>
            <PrimaryButton text="Add New Case" onClick={() => setIsModalOpen(true)} />
        </div>
    );
}