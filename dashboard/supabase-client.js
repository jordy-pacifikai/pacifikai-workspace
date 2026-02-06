// PACIFIK'AI Dashboard - Supabase Client
// Remplace toutes les intégrations Airtable par Supabase

const SUPABASE_URL = 'https://ogsimsfqwibcmotaeevb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nc2ltc2Zxd2liY21vdGFlZXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyMzY3NDYsImV4cCI6MjA4NDgxMjc0Nn0.3UdAzq1GQYOlZRlZ7-pXVMVJMEjDmTd68jUjoJWeAEI';

// Supabase client wrapper
class SupabaseClient {
    constructor() {
        this.url = SUPABASE_URL;
        this.key = SUPABASE_ANON_KEY;
        this.session = null;
        this.user = null;
        this.teamMember = null;
    }

    // Headers pour les requêtes API
    getHeaders() {
        const headers = {
            'apikey': this.key,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        };
        if (this.session?.access_token) {
            headers['Authorization'] = `Bearer ${this.session.access_token}`;
        }
        return headers;
    }

    // === AUTH ===

    async signIn(email, password) {
        const response = await fetch(`${this.url}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: {
                'apikey': this.key,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error_description || error.message || 'Erreur de connexion');
        }

        const data = await response.json();
        this.session = data;
        this.user = data.user;

        // Stocker la session
        localStorage.setItem('supabase_session', JSON.stringify(data));

        // Charger le profil team_member
        await this.loadTeamMember();

        return data;
    }

    async signOut() {
        if (this.session?.access_token) {
            await fetch(`${this.url}/auth/v1/logout`, {
                method: 'POST',
                headers: this.getHeaders()
            });
        }
        this.session = null;
        this.user = null;
        this.teamMember = null;
        localStorage.removeItem('supabase_session');
    }

    async restoreSession() {
        const stored = localStorage.getItem('supabase_session');
        if (!stored) return false;

        try {
            const session = JSON.parse(stored);

            // Vérifier si le token est encore valide
            const response = await fetch(`${this.url}/auth/v1/user`, {
                headers: {
                    'apikey': this.key,
                    'Authorization': `Bearer ${session.access_token}`
                }
            });

            if (response.ok) {
                this.session = session;
                this.user = await response.json();
                await this.loadTeamMember();
                return true;
            } else {
                // Token expiré, essayer de refresh
                return await this.refreshSession(session.refresh_token);
            }
        } catch (e) {
            console.error('Erreur restauration session:', e);
            localStorage.removeItem('supabase_session');
            return false;
        }
    }

    async refreshSession(refreshToken) {
        try {
            const response = await fetch(`${this.url}/auth/v1/token?grant_type=refresh_token`, {
                method: 'POST',
                headers: {
                    'apikey': this.key,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refresh_token: refreshToken })
            });

            if (response.ok) {
                const data = await response.json();
                this.session = data;
                this.user = data.user;
                localStorage.setItem('supabase_session', JSON.stringify(data));
                await this.loadTeamMember();
                return true;
            }
        } catch (e) {
            console.error('Erreur refresh session:', e);
        }
        localStorage.removeItem('supabase_session');
        return false;
    }

    async loadTeamMember() {
        if (!this.user) return;
        const members = await this.select('team_members', { id: `eq.${this.user.id}` });
        if (members.length > 0) {
            this.teamMember = members[0];
            // Mettre à jour last_seen
            this.update('team_members', this.user.id, { last_seen_at: new Date().toISOString() });
        }
    }

    isAuthenticated() {
        return !!this.session;
    }

    getCurrentUser() {
        return this.teamMember || this.user;
    }

    // === DATABASE OPERATIONS ===

    async select(table, filters = {}, options = {}) {
        let url = `${this.url}/rest/v1/${table}?`;

        // Appliquer les filtres
        for (const [key, value] of Object.entries(filters)) {
            url += `${key}=${encodeURIComponent(value)}&`;
        }

        // Options: order, limit, offset
        if (options.order) {
            url += `order=${options.order}&`;
        }
        if (options.limit) {
            url += `limit=${options.limit}&`;
        }
        if (options.offset) {
            url += `offset=${options.offset}&`;
        }

        // Select spécifique
        if (options.select) {
            url += `select=${options.select}&`;
        } else {
            url += 'select=*&';
        }

        const response = await fetch(url, {
            headers: this.getHeaders()
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Erreur Supabase: ${error}`);
        }

        return await response.json();
    }

    async insert(table, data) {
        const response = await fetch(`${this.url}/rest/v1/${table}`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Erreur insertion: ${error}`);
        }

        return await response.json();
    }

    async update(table, id, data) {
        const response = await fetch(`${this.url}/rest/v1/${table}?id=eq.${id}`, {
            method: 'PATCH',
            headers: this.getHeaders(),
            body: JSON.stringify({ ...data, updated_at: new Date().toISOString() })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Erreur update: ${error}`);
        }

        return await response.json();
    }

    async delete(table, id) {
        const response = await fetch(`${this.url}/rest/v1/${table}?id=eq.${id}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Erreur delete: ${error}`);
        }

        return true;
    }

    // === ACTIVITY LOG ===

    async logActivity(action, entityType, entityId, entityName, details = {}) {
        if (!this.teamMember) return;

        try {
            await this.insert('activity_log', {
                user_id: this.user.id,
                user_name: this.teamMember.display_name,
                action,
                entity_type: entityType,
                entity_id: entityId,
                entity_name: entityName,
                details
            });
        } catch (e) {
            console.error('Erreur log activity:', e);
        }
    }

    // === TEAM MEMBERS ===

    async getTeamMembers() {
        return await this.select('team_members', {}, { order: 'display_name.asc' });
    }

    // === PROSPECTS ===

    async getProspects() {
        return await this.select('prospects', {}, { order: 'created_at.desc' });
    }

    async getProspect(id) {
        const results = await this.select('prospects', { id: `eq.${id}` });
        return results[0];
    }

    async createProspect(data) {
        const result = await this.insert('prospects', {
            ...data,
            created_by: this.user?.id
        });
        await this.logActivity('create', 'prospect', result[0].id, data.entreprise);
        return result[0];
    }

    async updateProspect(id, data) {
        const prospect = await this.getProspect(id);
        const result = await this.update('prospects', id, data);
        await this.logActivity('update', 'prospect', id, prospect?.entreprise, { changes: data });
        return result[0];
    }

    async deleteProspect(id) {
        const prospect = await this.getProspect(id);
        await this.delete('prospects', id);
        await this.logActivity('delete', 'prospect', id, prospect?.entreprise);
    }

    async updateProspectStatus(id, status) {
        await this.updateProspect(id, { status });
        await this.logActivity('status_change', 'prospect', id, null, { new_status: status });
    }

    async assignProspect(id, assigneeId) {
        const prospect = await this.getProspect(id);
        const members = await this.getTeamMembers();
        const assignee = members.find(m => m.id === assigneeId);

        await this.update('prospects', id, { assigned_to: assigneeId });
        await this.logActivity('assign', 'prospect', id, prospect?.entreprise, {
            assignee_id: assigneeId,
            assignee_name: assignee?.display_name
        });
    }

    // === TASKS ===

    async getTasks() {
        return await this.select('tasks', {}, {
            order: 'created_at.desc',
            select: '*,prospect:prospects(id,entreprise),assignee:team_members!tasks_assigned_to_fkey(id,display_name,avatar_color)'
        });
    }

    async getTask(id) {
        const results = await this.select('tasks', { id: `eq.${id}` });
        return results[0];
    }

    async createTask(data) {
        const result = await this.insert('tasks', {
            ...data,
            created_by: this.user?.id
        });
        await this.logActivity('create', 'task', result[0].id, data.titre);
        return result[0];
    }

    async updateTask(id, data) {
        const task = await this.getTask(id);
        const result = await this.update('tasks', id, data);
        await this.logActivity('update', 'task', id, task?.titre, { changes: data });
        return result[0];
    }

    async deleteTask(id) {
        const task = await this.getTask(id);
        await this.delete('tasks', id);
        await this.logActivity('delete', 'task', id, task?.titre);
    }

    async updateTaskStatus(id, status) {
        const updates = { status };
        if (status === 'done') {
            updates.completed_at = new Date().toISOString();
        }
        await this.updateTask(id, updates);
        await this.logActivity('status_change', 'task', id, null, { new_status: status });
    }

    async assignTask(id, assigneeId) {
        const task = await this.getTask(id);
        const members = await this.getTeamMembers();
        const assignee = members.find(m => m.id === assigneeId);

        await this.update('tasks', id, { assigned_to: assigneeId });
        await this.logActivity('assign', 'task', id, task?.titre, {
            assignee_id: assigneeId,
            assignee_name: assignee?.display_name
        });
    }

    // === CONTENT CALENDAR ===

    async getContent() {
        return await this.select('content_calendar', {}, { order: 'published_at.desc' });
    }

    async createContent(data) {
        const result = await this.insert('content_calendar', {
            ...data,
            created_by: this.user?.id
        });
        await this.logActivity('create', 'content', result[0].id, data.titre);
        return result[0];
    }

    async updateContent(id, data) {
        const result = await this.update('content_calendar', id, data);
        await this.logActivity('update', 'content', id, data.titre);
        return result[0];
    }

    async deleteContent(id) {
        await this.delete('content_calendar', id);
        await this.logActivity('delete', 'content', id);
    }

    // === ASSETS ===

    async getAssets() {
        return await this.select('assets', {}, { order: 'created_at.desc' });
    }

    async getAssetsByProspect(prospectId) {
        return await this.select('assets', { prospect_id: `eq.${prospectId}` });
    }

    async createAsset(data) {
        return await this.insert('assets', {
            ...data,
            created_by: this.user?.id
        });
    }

    // === COMMENTS ===

    async getComments(entityType, entityId) {
        return await this.select('comments', {
            entity_type: `eq.${entityType}`,
            entity_id: `eq.${entityId}`
        }, { order: 'created_at.asc' });
    }

    async addComment(entityType, entityId, content) {
        const result = await this.insert('comments', {
            entity_type: entityType,
            entity_id: entityId,
            content,
            user_id: this.user?.id,
            user_name: this.teamMember?.display_name || 'Unknown'
        });
        await this.logActivity('comment', entityType, entityId, null, { comment: content });
        return result[0];
    }

    // === ACTIVITY FEED ===

    async getRecentActivity(limit = 50) {
        return await this.select('activity_log', {}, {
            order: 'created_at.desc',
            limit
        });
    }

    // === MESSENGER ===

    async getMessengerConversations() {
        return await this.select('messenger_conversations', {}, { order: 'created_at.desc' });
    }

    async getMessengerMessages(senderId = null) {
        const filters = senderId ? { sender_id: `eq.${senderId}` } : {};
        return await this.select('messenger_messages', filters, { order: 'created_at.desc', limit: 100 });
    }

    async getMessengerProspects() {
        return await this.select('messenger_prospects', {}, { order: 'last_contact_at.desc' });
    }

    async updateMessengerMessage(id, data) {
        return await this.update('messenger_messages', id, data);
    }

    async updateMessengerMessagesBatch(ids, data) {
        // Update multiple messages with same data
        const promises = ids.map(id => this.update('messenger_messages', id, data));
        return await Promise.all(promises);
    }

    async createMessengerMessage(data) {
        const result = await this.insert('messenger_messages', data);
        return result[0];
    }

    // === BLOG ARTICLES ===

    async getBlogArticles() {
        return await this.select('blog_articles', {}, { order: 'publish_date.desc' });
    }

    async getBlogArticle(id) {
        const results = await this.select('blog_articles', { id: `eq.${id}` });
        return results[0];
    }

    async createBlogArticle(data) {
        const result = await this.insert('blog_articles', data);
        await this.logActivity('create', 'blog', result[0].id, data.title);
        return result[0];
    }

    async updateBlogArticle(id, data) {
        const article = await this.getBlogArticle(id);
        const result = await this.update('blog_articles', id, data);
        await this.logActivity('update', 'blog', id, article?.title, { changes: data });
        return result[0];
    }

    async deleteBlogArticle(id) {
        const article = await this.getBlogArticle(id);
        await this.delete('blog_articles', id);
        await this.logActivity('delete', 'blog', id, article?.title);
    }

    // === NEWSLETTER CAMPAIGNS ===

    async getNewsletterCampaigns() {
        return await this.select('newsletter_campaigns', {}, { order: 'scheduled_date.desc' });
    }

    async getNewsletterCampaign(id) {
        const results = await this.select('newsletter_campaigns', { id: `eq.${id}` });
        return results[0];
    }

    async createNewsletterCampaign(data) {
        const result = await this.insert('newsletter_campaigns', data);
        await this.logActivity('create', 'newsletter', result[0].id, data.subject);
        return result[0];
    }

    async updateNewsletterCampaign(id, data) {
        const campaign = await this.getNewsletterCampaign(id);
        const result = await this.update('newsletter_campaigns', id, data);
        await this.logActivity('update', 'newsletter', id, campaign?.subject, { changes: data });
        return result[0];
    }

    async deleteNewsletterCampaign(id) {
        const campaign = await this.getNewsletterCampaign(id);
        await this.delete('newsletter_campaigns', id);
        await this.logActivity('delete', 'newsletter', id, campaign?.subject);
    }

    // === CLIENT INFRASTRUCTURES ===

    async getClientInfrastructures() {
        return await this.select('client_infrastructures', {}, {
            order: 'created_at.desc',
            select: '*,prospect:prospects(id,entreprise,secteur,status)'
        });
    }

    async getClientInfrastructure(id) {
        const results = await this.select('client_infrastructures', { id: `eq.${id}` });
        return results[0];
    }

    async getClientInfrastructureByProspect(prospectId) {
        const results = await this.select('client_infrastructures', { prospect_id: `eq.${prospectId}` });
        return results[0];
    }

    async getClientInfrastructureBySlug(slug) {
        const results = await this.select('client_infrastructures', { client_slug: `eq.${slug}` });
        return results[0];
    }

    async createClientInfrastructure(data) {
        const result = await this.insert('client_infrastructures', data);
        await this.logActivity('create', 'infrastructure', result[0].id, data.client_name);
        return result[0];
    }

    async updateClientInfrastructure(id, data) {
        const infra = await this.getClientInfrastructure(id);
        const result = await this.update('client_infrastructures', id, data);
        await this.logActivity('update', 'infrastructure', id, infra?.client_name, { changes: data });
        return result[0];
    }

    async addWorkflowToInfrastructure(infraId, workflow) {
        const infra = await this.getClientInfrastructure(infraId);
        const workflows = infra.workflows || [];
        workflows.push(workflow);
        return await this.updateClientInfrastructure(infraId, { workflows });
    }

    async addDocumentToInfrastructure(infraId, document) {
        const infra = await this.getClientInfrastructure(infraId);
        const documents = infra.documents || [];
        documents.push(document);
        return await this.updateClientInfrastructure(infraId, { documents });
    }
}

// Instance globale
const supabase = new SupabaseClient();

// Export pour utilisation dans le dashboard
window.supabase = supabase;
