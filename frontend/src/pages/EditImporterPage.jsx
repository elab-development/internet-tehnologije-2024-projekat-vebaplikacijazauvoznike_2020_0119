import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ImporterForm from '../components/importer/ImporterForm';
import { getImporter, updateImporter } from '../services/apiService';
import LoadingScreen from '../components/layout/LoadingScreen';

const EditImporterPage = () => {
  const { id } = useParams();
  const [importer, setImporter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImporter = async () => {
      try {
        const data = await getImporter(id);
        setImporter(data);
      } catch (err) {
        setError('Failed to load importer data.');
        console.error('Error fetching importer:', err); // Log the error
      } finally {
        setLoading(false);
      }
    };
    fetchImporter();
  }, [id]);

  const handleUpdate = async (formData) => {
    await updateImporter(id, formData);
  };

  if (loading) return <LoadingScreen />;
  if (error) return <p>{error}</p>;

  return <ImporterForm onSubmit={handleUpdate} importer={importer} isEdit />;
};

export default EditImporterPage;
