import SwiftUI

struct PerformanceView: View {
    @StateObject private var auth = AuthService.shared
    @State private var entries: [PerformanceEntry] = []

    var body: some View {
        NavigationStack {
            List(entries) { e in
                HStack { Text(e.metric); Spacer(); Text(e.value).foregroundColor(.secondary) }
            }
            .navigationTitle("Performance")
        }
        .onAppear { Task { await load() } }
    }

    private func load() async {
        guard let email = auth.currentEmail else { return }
        entries = await PortalDataService.fetchPerformance(email: email)
    }
}


