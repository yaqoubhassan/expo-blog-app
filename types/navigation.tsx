import { NavigatorScreenParams } from "@react-navigation/native";

export type DrawerParamList = {
    Posts: undefined; // No parameters for the Posts screen
    CreatePost: undefined; // No parameters for Create Post screen
    Details: { postId: string }; // 'Details' screen expects a 'postId' parameter
};

