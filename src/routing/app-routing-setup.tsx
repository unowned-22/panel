import { Navigate, Route, Routes } from 'react-router';
import { Auth, RequireAuth, RequireGuest } from "@/modules/auth";
import { ErrorRouting } from '@/errors/error-routing';
import { MainLayout } from '@/layouts/main/layout';
import Home from "@/me/pages/home";
import Settings from "@/me/pages/settings";
import Account from "@/me/pages/account";
import AddAccountPage from "@/me/pages/add-account";
import FeedPage from "@/me/pages/feed";
import Notification from "@/me/pages/notification";
import ProfilePage from "@/profile/pages/profile";
import Friends from "@/me/pages/friends";
import Photos from "@/me/pages/photos";
import PhotoAlbum from "@/me/pages/photo-album";
import Calls from "@/me/pages/calls";
import Video from "@/me/pages/video/video";
import { CreateVideo } from "@/me/pages/video/video-create";
import { CommunityComments } from "@/me/pages/video/video-community";
import { ChannelAnalytics } from "@/me/pages/video/video-analytics";
import VideoPage from "@/me/pages/video/video-player";
import Groups from "@/me/pages/groups";
import Messenger from "@/me/pages/messenger";
import Analytics from "@/me/pages/analytics";
import Bookmarks from "@/me/pages/bookmarks";
import Stickers from "@/me/pages/stickers";
import Services from "@/me/pages/services";
import Clips from "@/me/pages/clips";
import Games from "@/me/pages/games";
import Market from "@/me/pages/market";
import Music from "@/me/pages/music";
import Search from "@/me/pages/search";
import Feed from "@/me/pages/me/feed";
import { CreateMusic } from "@/me/pages/audio/create";
import { MusicAnalytics } from "@/me/pages/audio/analytics";
import { MusicRadio } from "@/me/pages/audio/radio";
import { MusicLive } from "@/me/pages/audio/live";
import { MusicAlbums } from "@/me/pages/audio/albums";
import { MusicPodcasts } from "@/me/pages/audio/podcasts";
import { MusicTrackComments } from "@/me/pages/audio/track-comments";
import { MusicCollabPlaylists } from "@/me/pages/audio/collab-playlists";
import { MusicDistribution } from "@/me/pages/audio/distribution";
import { MusicContentId } from "@/me/pages/audio/content-id";
import { MusicTrafficSources } from "@/me/pages/audio/sources";

import Profile from "@/me/pages/me/profile";
import UserProfile from "@/me/pages/user-profile";

export function AppRoutingSetup() {
    return (
        <Routes>
            <Route element={<RequireAuth />}>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/me/settings" element={<Settings />} />
                    <Route path="/me/account" element={<Account />} />
                    <Route path="/me/login" element={<AddAccountPage />} />
                    <Route path="/me/feed" element={<FeedPage />} />
                    <Route path="/me/games" element={<Games />} />
                    <Route path="/me/market" element={<Market />} />
                    <Route path="/me/music" element={<Music />} />
                    <Route path="/me/music/create" element={<CreateMusic />} />
                    <Route path="/me/music/analytics" element={<MusicAnalytics />} />
                    <Route path="/me/music/radio" element={<MusicRadio />} />
                    <Route path="/me/music/live" element={<MusicLive />} />
                    <Route path="/me/music/albums" element={<MusicAlbums />} />
                    <Route path="/me/music/podcasts" element={<MusicPodcasts />} />
                    <Route path="/me/music/comments" element={<MusicTrackComments />} />
                    <Route path="/me/music/collab" element={<MusicCollabPlaylists />} />
                    <Route path="/me/music/distribution" element={<MusicDistribution />} />
                    <Route path="/me/music/content-id" element={<MusicContentId />} />
                    <Route path="/me/music/sources" element={<MusicTrafficSources />} />
                    <Route path="/me/notifications" element={<Notification />} />
                    <Route path="/me/friends" element={<Friends />} />
                    <Route path="/me/photos" element={<Photos />} />
                    <Route path="/me/photos/album/:id" element={<PhotoAlbum />} />
                    <Route path="/me/calls" element={<Calls />} />
                    <Route path="/me/video" element={<Video />} />
                    <Route path="/me/video/create" element={<CreateVideo />} />
                    <Route path="/me/video/community" element={<CommunityComments />} />
                    <Route path="/me/video/analytics" element={<ChannelAnalytics />} />
                    <Route path="/me/video/q/:video" element={<VideoPage />} />
                    <Route path="/me/groups" element={<Groups />} />
                    <Route path="/me/analytics" element={<Analytics />} />
                    <Route path="/me/messenger" element={<Messenger />} />
                    <Route path="/me/messenger/:username" element={<Messenger />} />
                    <Route path="/me/bookmarks" element={<Bookmarks />} />
                    <Route path="/me/stickers" element={<Stickers />} />
                    <Route path="/me/services" element={<Services />} />
                    <Route path="/me/clips" element={<Clips />} />
                    <Route path="/me/search" element={<Search />} />
                    <Route path="/profile/:username" element={<ProfilePage />} />
                    <Route path="/user-profile/:id" element={<UserProfile />} />
                    <Route path="/user/feed" element={<Feed />} />
                    <Route path="/user/profile" element={<Profile />} />
                </Route>
            </Route>
            <Route path="error/*" element={<ErrorRouting />} />
            <Route element={<RequireGuest />}>
                <Route path="auth/*" element={<Auth />} />
            </Route>
            <Route path="*" element={<Navigate to="/error/404" />} />
        </Routes>
    );
}