import SwiftUI

@main
struct DraftingApp: App {
    var body: some Scene {
        WindowGroup {
            MainView()
            #if os(macOS)
                .frame(minWidth: 1000, minHeight: 700)
            #endif
        }
    }
}

