import { createSlice } from "@reduxjs/toolkit";

export const serviceSlice = createSlice({
  name: "service",
  initialState: {
    openAddPostModal: false,
    openEditProfileModal: false,
    anchorE1: null,
    anchorE2: null,
    darkMode: false,
    myInfo: null,
    user: {},
    allPosts: [],
    postId: null,
    searchedUsers: [],
  },
  reducers: {
    addPostModal: (state, action) => {
      state.openAddPostModal = action.payload;
    },
    editProfileModal: (state, action) => {
      state.anchorE1 = action.payload;
    },
    toggleMainMenu: (state, action) => {
      state.openMainMenu = action.payload;
    },
    toggleMyMenu: (state, action) => {
      state.openMyMenu = action.payload;
    },
    toggleColorMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    addMyInfo: (state, action) => {
      state.myInfo = action.payload.me;
    },
    addUser: (state, action) => {
      state.user = action.payload;
    },
    addToAllPost: (state, action) => {
      const newPostArr = [...action.payload.posts];
      if (state.allPosts.length === 0) {
        state.allPosts = newPostArr;
        return;
      }
      const existingPosts = [...state.allPosts];
      newPostArr.forEach((e) => {
        const exisitingIndex = existingPosts.findIndex((i) => {
          return i._id === e._id;
        });
        if (exisitingIndex !== -1) {
          existingPosts[exisitingIndex] = e;
        } else {
          existingPosts.push(e);
        }
      });
      state.allPosts = existingPosts;
    },
    addSingle: (state, action) => {
      let newArr = [...state.allPosts];
      let updatedArr = [action.payload.newPost, ...newArr];
      uniqueArr = new Set();
      let uniquePosts = updatedArr.filter((e) => {
        if (!uniqueArr.has(e._id)) {
          uniqueArr.add(e);
          return true;
        }
        return false;
      });
      state.allPosts = [...uniquePosts];
    },
    deleteThePost: (state, action) => {
      let postArr = [...state.allPosts];
      let newArr = postArr.filter((e) => e._id !== state.postId);
      state.allPosts = newArr;
    },
    addToSearchedUsers: (state, action) => {
      state.searchedUsers = action.payload;
    },
    addPostId: (state, action) => {
      state.postId = action.payload;
    },
  },
});

export const {
  addPostModal,
  editProfileModal,
  toggleMainMenu,
  toggleMyMenu,
  toggleColorMode,
  addMyInfo,
  addUser,
  addToAllPost,
  addSingle,
  deleteThePost,
  addToSearchedUsers,
  addPostId,
} = serviceSlice.actions;

export default serviceSlice.reducer;
