import PageWrapper from '../components/layout/PageWrapper';

export default function Rules() {
  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-dark-50">XP & Leveling Rules</h1>
          <p className="text-dark-400 mt-2 text-lg">Everything you need to know about progressing in communities and challenges.</p>
        </div>

        <div className="card space-y-6">
          <section>
            <h2 className="text-xl font-bold text-primary-400 mb-3 flex items-center gap-2">
              <span>🌟</span> How to Earn XP
            </h2>
            <ul className="space-y-3 text-dark-300 ml-6 list-disc marker:text-primary-500">
              <li><strong>Checking In:</strong> Every time you submit proof or check in to a challenge, you earn <span className="font-bold text-dark-50">10 XP</span> globally and <span className="font-bold text-dark-50">10 XP</span> for the host community.</li>
              <li><strong>Goal Completion:</strong> Marking your daily goals as completed also contributes to your global XP, helping you climb the main leaderboard.</li>
            </ul>
          </section>

          <hr className="border-dark-700" />

          <section>
            <h2 className="text-xl font-bold text-accent-400 mb-3 flex items-center gap-2">
              <span>📈</span> Community Leveling System
            </h2>
            <p className="text-dark-300 mb-4 leading-relaxed">
              When you earn XP within a specific community, it goes towards your Community Level. 
              <strong> When you level up, your XP resets to 0</strong> so you can start working towards the next milestone!
            </p>
            <div className="bg-dark-800 rounded-lg p-4 border border-dark-700 overflow-x-auto">
              <table className="w-full text-left text-sm text-dark-300">
                <thead className="text-xs uppercase text-dark-400 border-b border-dark-600">
                  <tr>
                    <th className="py-2 px-4">Level</th>
                    <th className="py-2 px-4">XP Required</th>
                    <th className="py-2 px-4">Total Cumulative XP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700">
                  <tr className="hover:bg-dark-700/50 transition-colors">
                    <td className="py-2 px-4 font-bold text-dark-50">Level 1 → 2</td>
                    <td className="py-2 px-4 text-accent-400">500 XP</td>
                    <td className="py-2 px-4">500 XP</td>
                  </tr>
                  <tr className="hover:bg-dark-700/50 transition-colors">
                    <td className="py-2 px-4 font-bold text-dark-50">Level 2 → 3</td>
                    <td className="py-2 px-4 text-accent-400">1000 XP</td>
                    <td className="py-2 px-4">1500 XP</td>
                  </tr>
                  <tr className="hover:bg-dark-700/50 transition-colors">
                    <td className="py-2 px-4 font-bold text-dark-50">Level 3 → 4</td>
                    <td className="py-2 px-4 text-accent-400">2000 XP</td>
                    <td className="py-2 px-4">3500 XP</td>
                  </tr>
                  <tr className="hover:bg-dark-700/50 transition-colors">
                    <td className="py-2 px-4 font-bold text-dark-50">Level 4 → 5</td>
                    <td className="py-2 px-4 text-accent-400">5000 XP</td>
                    <td className="py-2 px-4">8500 XP</td>
                  </tr>
                  <tr className="hover:bg-dark-700/50 transition-colors">
                    <td className="py-2 px-4 font-bold text-success-400">Level 5</td>
                    <td className="py-2 px-4 text-dark-400 italic">Max Level Reached</td>
                    <td className="py-2 px-4">8500+ XP</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <hr className="border-dark-700" />

          <section>
            <h2 className="text-xl font-bold text-success-400 mb-3 flex items-center gap-2">
              <span>🛡️</span> Milestone Badges
            </h2>
            <p className="text-dark-300 leading-relaxed">
              Community Creators can assign custom <strong>Milestone Badges</strong> to each level (1-5). 
              Once you hit the required level, you automatically earn that badge! 
              These badges will appear next to your name in the community and in the Recent Badges section on your main dashboard.
            </p>
          </section>
        </div>
      </div>
    </PageWrapper>
  );
}
