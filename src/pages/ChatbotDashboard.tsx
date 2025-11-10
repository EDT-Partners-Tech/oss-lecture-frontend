// © [2025] EDT&Partners. Licensed under CC BY 4.0.
import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/layout';
import { getChatbots, deleteChatbot } from '../services/api';
import { ChatbotList, ChatbotFile } from '../types';
import { FaPlus, FaRobot, FaList, FaThLarge } from 'react-icons/fa';
import Dialog from '../components/dialog';
import ChatbotMaterialsModal from '../components/chatbot-materials-modal';
import { showToast } from '../services/toastService';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';
import { subscribeToEvent, unsubscribeFromEvent } from '../utils/appsyncEvents';
import { ChatbotCard, ChatbotRow } from '../components/chatbot';

const ChatbotDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAppSyncSubscribed } = useAuth();
  const [chatbots, setChatbots] = useState<ChatbotList[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [selectedChatbotId, setSelectedChatbotId] = useState<string | null>(null);
  const [showMaterialsModal, setShowMaterialsModal] = useState<boolean>(false);
  const [selectedChatbotMaterials, setSelectedChatbotMaterials] = useState<ChatbotFile[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    const savedMode = localStorage.getItem('chatbotViewMode');
    return (savedMode === 'list' || savedMode === 'grid') ? savedMode : 'grid';
  });

  useEffect(() => {
    localStorage.setItem('chatbotViewMode', viewMode);
  }, [viewMode]);

  const fetchChatbots = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getChatbots();
      setChatbots(data);
    } catch (error) {
      console.error('Error getting the chatbots:', error);
      showToast('error', t('chatbot_dashboard.error_loading_chatbots'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchChatbots();
  }, [fetchChatbots]);

  // Suscribirse al evento de actualización de chatbots
  useEffect(() => {
    if (isAppSyncSubscribed) {
      const handleChatbotUpdate = () => {
        fetchChatbots();
      };

      subscribeToEvent('chatbotUpdate', handleChatbotUpdate);

      return () => {
        unsubscribeFromEvent('chatbotUpdate', handleChatbotUpdate);
      };
    }
  }, [isAppSyncSubscribed, fetchChatbots]);

  const handleDeleteChatbot = async (id: string) => {
    try {
      setDeleteLoading(id);
      await deleteChatbot(id);
      setChatbots(chatbots.filter(chatbot => chatbot.chatbot_id !== id));
      showToast('success', t('chatbot_dashboard.chatbot_deleted_successfully'));
    } catch (error) {
      console.error('Error deleting the chatbot:', error);
      showToast('error', t('chatbot_dashboard.error_deleting_chatbot'));
    } finally {
      setDeleteLoading(null);
      setSelectedChatbotId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderLoadingState = () => (
    <div className="flex justify-center items-center h-48 sm:h-64">
      <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 sm:p-8 text-center max-w-2xl mx-auto">
      <FaRobot className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400 mx-auto mb-4" />
      <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
        {t('chatbot_dashboard.no_chatbots_created')}
      </h2>
      <p className="text-sm sm:text-base text-gray-500 mb-6">
        {t('chatbot_dashboard.create_your_first_chatbot')}
      </p>
      <Link
        to="/chatbot/create"
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        <FaPlus className="w-4 h-4" />
        <span>{t('chatbot_dashboard.new_chatbot')}</span>
      </Link>
    </div>
  );

  const handleShowMaterials = (e: React.MouseEvent, materials: ChatbotFile[]) => {
    e.preventDefault();
    setSelectedChatbotMaterials(materials);
    setShowMaterialsModal(true);
  };

  const renderChatbotList = () => {
    if (viewMode === 'list') {
      return (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('chatbot_dashboard.name')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('chatbot_dashboard.description')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('chatbot_dashboard.last_updated')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('chatbot_dashboard.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {chatbots.map(chatbot => (
                <ChatbotRow
                  key={chatbot.chatbot_id}
                  chatbot={chatbot}
                  deleteLoading={deleteLoading}
                  onDelete={(id) => {
                    setShowDeleteDialog(true);
                    setSelectedChatbotId(id);
                  }}
                  onShowMaterials={handleShowMaterials}
                  formatDate={formatDate}
                  t={t}
                />
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 max-w-3xl lg:max-w-none mx-auto">
        {chatbots.map(chatbot => (
          <ChatbotCard
            key={chatbot.chatbot_id}
            chatbot={chatbot}
            deleteLoading={deleteLoading}
            onDelete={(id) => {
              setShowDeleteDialog(true);
              setSelectedChatbotId(id);
            }}
            onShowMaterials={handleShowMaterials}
            formatDate={formatDate}
            t={t}
          />
        ))}
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return renderLoadingState();
    }

    if (chatbots.length === 0) {
      return renderEmptyState();
    }

    return renderChatbotList();
  };

  return (
    <Layout title={t('chatbot_dashboard.title')}>
      <div className="flex justify-start">
        <button
          className="px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
          onClick={() => navigate('/dashboard')}
        >
          {t('chatbot_dashboard.back')}
        </button>
      </div>
      <div className="relative min-h-[calc(95vh-10rem)]">
        {/* Fondo con blur */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#70828a56] to-[#06244d71] blur-3xl"></div>

        {/* Contenido nítido */}
        <div className="relative mx-auto px-4 py-6 flex-1 w-full z-10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6 mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 rounded-lg bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-200 shadow-lg"
                title={viewMode === 'grid' ? t('chatbot_dashboard.switch_to_list_view') : t('chatbot_dashboard.switch_to_grid_view')}
              >
                {viewMode === 'grid' ? (
                  <FaList className="w-5 h-5 text-gray-600" />
                ) : (
                  <FaThLarge className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
            <Link
              to="/chatbot/create"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-sm transition-all duration-200 min-w-[160px] shadow-lg hover:shadow-xl"
            >
              <FaPlus className="w-4 h-4" />
              <span>{t('chatbot_dashboard.new_chatbot')}</span>
            </Link>
          </div>

          <div className="overflow-y-auto max-h-[calc(100vh-16rem)] px-1 scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-gray-100 hover:scrollbar-thumb-blue-700">
            {renderContent()}
          </div>
        </div>
      </div>

      {showDeleteDialog && selectedChatbotId && (
        <Dialog
          title={t('chatbot_dashboard.delete_chatbot')}
          description={t('chatbot_dashboard.delete_chatbot_description', { name: chatbots.find(chatbot => chatbot.chatbot_id === selectedChatbotId)?.chatbot_name })}
          onConfirm={() => {
            handleDeleteChatbot(selectedChatbotId);
            setShowDeleteDialog(false);
          }}
          onCancel={() => {
            setShowDeleteDialog(false);
            setSelectedChatbotId(null);
          }}
          confirmText={t('chatbot_dashboard.delete')}
          cancelText={t('chatbot_dashboard.cancel')}
        />
      )}

      {showMaterialsModal && (
        <ChatbotMaterialsModal
          isOpen={showMaterialsModal}
          onClose={() => setShowMaterialsModal(false)}
          materials={selectedChatbotMaterials}
        />
      )}
    </Layout>
  );
};

export default ChatbotDashboard;
