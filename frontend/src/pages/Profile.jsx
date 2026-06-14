import useAuthStore from '../store/authStore';

const Profile = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900">Your Profile</h2>
        <p className="mt-2 text-slate-600">Manage your account settings and preferences.</p>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center space-x-6 mb-8">
          <div className="h-24 w-24 rounded-full bg-brand-indigo flex items-center justify-center text-white text-3xl font-bold">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">{user?.name}</h3>
            <p className="text-slate-500">{user?.email}</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-indigo/10 text-brand-indigo mt-2">
              {user?.role || 'user'}
            </span>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-8">
          <h4 className="text-lg font-medium text-slate-900 mb-4">Account Information</h4>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-8">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-slate-500">Full name</dt>
              <dd className="mt-1 text-sm text-slate-900">{user?.name}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-slate-500">Email address</dt>
              <dd className="mt-1 text-sm text-slate-900">{user?.email}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default Profile;
