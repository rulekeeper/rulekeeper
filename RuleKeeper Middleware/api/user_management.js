const EventManager = require('../events/EventManager');

module.exports = {
    /**
     * Sends event to the Manager, to creates a new user with its role and the entity it represents.
     * @param userId - id of the user
     * @param role - role of the user
     * @param entity - entity associated with the user
     */
    new_user(userId, role, entity) {
        EventManager.sendNewUserEvent( userId, role, entity);
    },

    /**
     * Sends event to the Manager, to attribute a new role to a user.
     * @param userId - id of the user
     * @param role - new role of the user
     */
    change_role(userId, role) {
        EventManager.sendChangeUserRoleEvent( userId, role);
    },

    /**
     * Sends event to the Manager, to attribute a new entity to a user.
     * @param userId - id of the user
     * @param entity - new entity of the user
     */
    change_entity(userId, entity) {
        EventManager.sendChangeUserEntityEvent( userId, entity);
    },

    /**
     * Sends event to the Manager, to remove a user.
     * @param userId - id of the user
     */
    remove_principal(userId) {
        EventManager.sendRemoveUserEvent( userId);
    },
}
