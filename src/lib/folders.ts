/**
 * Folder whose notes are kept out of "All Notes" (and out of search from there).
 * They stay reachable by opening the folder itself, which sits pinned to the
 * bottom of the folder list. Shared by server and client code, so this module
 * must stay free of node-only imports.
 */
export const TRASH_FOLDER = "Recently Deleted";
