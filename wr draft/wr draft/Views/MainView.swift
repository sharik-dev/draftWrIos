import SwiftUI

struct MainView: View {
    @StateObject var viewModel = DraftViewModel()
    @AppStorage("app.language") private var language = "FR"
    
    var body: some View {
        TabView {
            // Tab 1: Draft Mode
            GeometryReader { proxy in
                let width = proxy.size.width
                ZStack {
                    Color(hex: "0D1B2A").ignoresSafeArea()
                    
                    if width < 700 {
                        CompactDraftView(viewModel: viewModel, language: $language)
                    } else {
                        VStack(spacing: 0) {
                            header(title: L10n.tr("draft_title", language))
                            WideDraftView(viewModel: viewModel, language: language)
                        }
                    }
                }
            }
            .tabItem {
                Label(L10n.tr("draft_tab", language), systemImage: "shield.fill")
            }
            
            // Tab 2: Counter Lookup Mode
            NavigationStack {
                CounterLookupView(viewModel: viewModel, language: language)
            }
            .tabItem {
                Label(L10n.tr("counters_tab", language), systemImage: "bolt.fill")
            }
        }
        .preferredColorScheme(.dark)
        .accentColor(Color(hex: "D4AF37"))
    }
    
    // MARK: - Header
    func header(title: String) -> some View {
        HStack {
            Spacer()
            
            HStack(spacing: 15) {
                Button {
                    language = "FR"; viewModel.language = "FR"; viewModel.updateRecommendations(); viewModel.updateLookupResults()
                } label: {
                    Text("FR").opacity(language == "FR" ? 1.0 : 0.5)
                }
                .buttonStyle(.plain)
                
                Button {
                    language = "EN"; viewModel.language = "EN"; viewModel.updateRecommendations(); viewModel.updateLookupResults()
                } label: {
                    Text("EN").opacity(language == "EN" ? 1.0 : 0.5)
                }
                .buttonStyle(.plain)
            }
            .font(.caption.bold())
        }
        .padding()
        .background(Color(white: 0.1))
        .overlay(
            Rectangle().frame(height: 1).foregroundColor(Color(hex: "D4AF37").opacity(0.3)),
            alignment: .bottom
        )
    }
}

// MARK: - Mise en page large (iPad / macOS)
struct WideDraftView: View {
    @ObservedObject var viewModel: DraftViewModel
    var language: String
    
    var body: some View {
        HStack(spacing: 0) {
            // Colonne gauche: ALLY
            DraftColumnView(
                title: L10n.tr("ally", language),
                picks: viewModel.teamPicks,
                side: .ally,
                activeIndex: viewModel.activeSlot?.side == .ally ? viewModel.activeSlot?.index : nil,
                onSelect: { viewModel.selectSlot(side: .ally, index: $0) },
                onRemove: { viewModel.removePick(side: .ally, index: $0) },
                language: viewModel.language
            )
            .frame(width: 260)
            
            // Panneau central
            CenterPanelView(viewModel: viewModel)
            
            // Colonne droite: ENEMY
            DraftColumnView(
                title: L10n.tr("enemy", language),
                picks: viewModel.enemyPicks,
                side: .enemy,
                activeIndex: viewModel.activeSlot?.side == .enemy ? viewModel.activeSlot?.index : nil,
                onSelect: { viewModel.selectSlot(side: .enemy, index: $0) },
                onRemove: { viewModel.removePick(side: .enemy, index: $0) },
                language: viewModel.language
            )
            .frame(width: 260)
        }
    }
}

// MARK: - Mise en page compacte (iPhone)
struct CompactDraftView: View {
    @ObservedObject var viewModel: DraftViewModel
    @Binding var language: String
    
    @State private var selectedSide: DraftViewModel.SlotSelection.Side = .ally
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    // Stats compactes
                    TeamStatsView(
                        allyStrength: viewModel.teamStrength,
                        enemyStrength: viewModel.enemyStrength,
                        allyStats: viewModel.teamStats,
                        enemyStats: viewModel.enemyStats,
                        language: language
                    )
                    .padding(.top, 8)
                    
                    // Sélecteur ALLY / ENEMY
                    Picker(L10n.tr("side", language), selection: $selectedSide) {
                        Text(L10n.tr("ally", language)).tag(DraftViewModel.SlotSelection.Side.ally)
                        Text(L10n.tr("enemy", language)).tag(DraftViewModel.SlotSelection.Side.enemy)
                    }
                    .pickerStyle(.segmented)
                    .padding(.horizontal)
                    .onChange(of: selectedSide) { _ in
                        selectDefaultSlot()
                    }
                    
                    // Slots (5 rôles)
                    VStack(spacing: 8) {
                        ForEach(0..<5, id: \.self) { i in
                            SlotView(
                                role: rolesLabel[i],
                                champion: currentPicks[i],
                                isActive: viewModel.activeSlot?.side == selectedSide && viewModel.activeSlot?.index == i,
                                side: selectedSide,
                                language: language,
                                onTap: {
                                    viewModel.selectSlot(side: selectedSide, index: i)
                                },
                                onRemove: {
                                    viewModel.removePick(side: selectedSide, index: i)
                                }
                            )
                        }
                    }
                    .padding(.horizontal)
                    
                    // Filtres: recherche + rôle
                    VStack(spacing: 12) {
                        HStack {
                            Image(systemName: "magnifyingglass")
                            TextField(
                                L10n.tr("search_placeholder", language),
                                text: Binding(
                                    get: { viewModel.filters.search },
                                    set: { viewModel.filters.search = $0; viewModel.updateRecommendations() }
                                )
                            )
                        }
                        .padding(10)
                        .background(Color.white.opacity(0.1))
                        .cornerRadius(8)
                        
                        RoleSelectorView(
                            selectedRole: Binding(
                                get: { viewModel.filters.role },
                                set: { viewModel.filters.role = $0 }
                            )
                        ) {
                            viewModel.updateRecommendations()
                        }
                    }
                    .padding(.horizontal)
                    
                    // Indicateur de sélection
                    if let slot = viewModel.activeSlot {
                        HStack {
                            Circle()
                                .fill(slot.side == .ally ? Color(hex: "00FFC8") : Color(hex: "FF3366"))
                                .frame(width: 10, height: 10)
                            
                            Text("\(L10n.tr("selecting_for", language)) \(slot.side == .ally ? L10n.tr("ally", language) : L10n.tr("enemy", language)) - \(L10n.tr(viewModel.slotRoles[slot.index], language))")
                                .font(.caption.bold())
                                .foregroundColor(Color(hex: "D4AF37"))
                            
                            Spacer()
                        }
                        .padding(.horizontal)
                    }
                    
                    // Recommandations
                    LazyVStack(spacing: 12) {
                        ForEach(viewModel.recommendations) { rec in
                            RecommendationRow(recommendation: rec, language: language) {
                                viewModel.pickChampion(rec.champion)
                            }
                        }
                    }
                    .padding(.horizontal)
                    .padding(.bottom, 16)
                }
            }
            .background(Color(hex: "050A0F"))
            .toolbar {
            
                ToolbarItem(placement: .navigationBarTrailing) {
                    Menu {
                        Button {
                            language = "FR"; viewModel.language = "FR"; viewModel.updateRecommendations(); viewModel.updateLookupResults()
                        } label: {
                            Label("Français", systemImage: language == "FR" ? "checkmark" : "")
                        }
                        Button {
                            language = "EN"; viewModel.language = "EN"; viewModel.updateRecommendations(); viewModel.updateLookupResults()
                        } label: {
                            Label("English", systemImage: language == "EN" ? "checkmark" : "")
                        }
                        Divider()
                        Button(role: .destructive) {
                            viewModel.resetDraft()
                            selectedSide = .ally
                            selectDefaultSlot()
                        } label: {
                            Label(L10n.tr("reset_draft", language), systemImage: "arrow.counterclockwise")
                        }
                    } label: {
                        Image(systemName: "ellipsis.circle")
                    }
                }
            }
            .onAppear {
                viewModel.language = language
                selectDefaultSlot()
            }
        }
    }
    
    private var rolesLabel: [String] {
        [
            L10n.tr("top", language),
            L10n.tr("jungle", language),
            L10n.tr("mid", language),
            L10n.tr("adc", language),
            L10n.tr("support", language)
        ]
    }
    
    private var currentPicks: [Champion?] {
        selectedSide == .ally ? viewModel.teamPicks : viewModel.enemyPicks
    }
    
    private func selectDefaultSlot() {
        let picks = currentPicks
        let firstEmpty = (0..<5).first(where: { picks[$0] == nil }) ?? 0
        viewModel.selectSlot(side: selectedSide, index: firstEmpty)
    }
}

// MARK: - Panneau central (recyclé pour grand écran)
struct CenterPanelView: View {
    @ObservedObject var viewModel: DraftViewModel
    
    var body: some View {
        VStack(spacing: 0) {
            // Stats
            TeamStatsView(
                allyStrength: viewModel.teamStrength,
                enemyStrength: viewModel.enemyStrength,
                allyStats: viewModel.teamStats,
                enemyStats: viewModel.enemyStats,
                language: viewModel.language
            )
            
            // Recherche & filtre
            HStack {
                HStack {
                    Image(systemName: "magnifyingglass")
                    TextField(
                        L10n.tr("search_placeholder", viewModel.language),
                        text: Binding(
                            get: { viewModel.filters.search },
                            set: { viewModel.filters.search = $0; viewModel.updateRecommendations() }
                        )
                    )
                }
                .padding(10)
                .background(Color.white.opacity(0.1))
                .cornerRadius(8)
                
                Spacer()
                
                RoleSelectorView(
                    selectedRole: Binding(
                        get: { viewModel.filters.role },
                        set: { viewModel.filters.role = $0 }
                    )
                ) {
                    viewModel.updateRecommendations()
                }
            }
            .padding()
            
            // Indicateur de sélection
            if let slot = viewModel.activeSlot {
                HStack {
                    Circle()
                        .fill(slot.side == .ally ? Color(hex: "00FFC8") : Color(hex: "FF3366"))
                        .frame(width: 10, height: 10)
                    
                    Text("\(L10n.tr("selecting_for", viewModel.language)) \(slot.side == .ally ? L10n.tr("ally", viewModel.language) : L10n.tr("enemy", viewModel.language)) - \(L10n.tr(viewModel.slotRoles[slot.index], viewModel.language))")
                        .font(.caption.bold())
                        .foregroundColor(Color(hex: "D4AF37"))
                    
                    Spacer()
                }
                .padding(.horizontal)
                .padding(.bottom, 10)
            }
            
            // Liste des recommandations
            ScrollView {
                LazyVStack(spacing: 12) {
                    ForEach(viewModel.recommendations) { rec in
                        RecommendationRow(recommendation: rec, language: viewModel.language) {
                            viewModel.pickChampion(rec.champion)
                        }
                    }
                }
                .padding()
            }
        }
        .background(Color(hex: "050A0F"))
    }
}

// MARK: - Composants existants réutilisés/adaptés

struct TeamStatsView: View {
    var allyStrength: Double
    var enemyStrength: Double
    var allyStats: TeamStats
    var enemyStats: TeamStats
    var language: String
    
    @State private var showDetails = false
    
    var body: some View {
        VStack(spacing: 0) {
            // Main Strength Bars
            HStack(spacing: 20) {
                VStack(alignment: .leading) {
                    Text(L10n.tr("ally_power", language))
                        .font(.caption.bold())
                        .foregroundColor(Color(hex: "00FFC8"))
                    ProgressView(value: allyStrength)
                        .tint(Color(hex: "00FFC8"))
                }
                
                Text("VS")
                    .font(.custom("Avenir-Black", size: 28))
                    .foregroundColor(Color(hex: "D4AF37"))
                    .shadow(color: Color(hex: "D4AF37").opacity(0.5), radius: 10)
                
                VStack(alignment: .trailing) {
                    Text(L10n.tr("enemy_power", language))
                        .font(.caption.bold())
                        .foregroundColor(Color(hex: "FF3366"))
                    ProgressView(value: enemyStrength)
                        .tint(Color(hex: "FF3366"))
                        .rotationEffect(.degrees(180))
                }
            }
            .padding(.horizontal)
            .padding(.top)
            
            // Toggle Details
            Button {
                withAnimation(.spring()) {
                    showDetails.toggle()
                }
            } label: {
                HStack(spacing: 4) {
                    Image(systemName: showDetails ? "chevron.up" : "chevron.down")
                    Text(showDetails ? L10n.tr("hide_stats", language) : L10n.tr("show_stats", language))
                }
                .font(.system(size: 10, weight: .bold))
                .foregroundColor(.white.opacity(0.6))
                .padding(.vertical, 4)
                .padding(.horizontal, 12)
                .background(Color.white.opacity(0.05))
                .cornerRadius(4)
            }
            .padding(.vertical, 8)
            .buttonStyle(.plain)
            
            // Detailed Gauges
            if showDetails {
                HStack(alignment: .top, spacing: 30) {
                    DetailedStatPanel(title: L10n.tr("ally_stats_title", language), stats: allyStats, color: Color(hex: "00FFC8"), language: language)
                    Divider().background(Color.white.opacity(0.1)).frame(height: 100)
                    DetailedStatPanel(title: L10n.tr("enemy_stats_title", language), stats: enemyStats, color: Color(hex: "FF3366"), language: language)
                }
                .padding(.bottom)
                .transition(.move(edge: .top).combined(with: .opacity))
            }
        }
        .background(
            LinearGradient(colors: [Color(hex: "0D1B2A"), Color(hex: "050A0F")], startPoint: .top, endPoint: .bottom)
        )
        .overlay(
            Rectangle().frame(height: 2).foregroundColor(Color(hex: "D4AF37").opacity(0.3)),
            alignment: .bottom
        )
    }
}

struct DetailedStatPanel: View {
    let title: String
    let stats: TeamStats
    let color: Color
    let language: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            // AD / AP
            VStack(alignment: .leading, spacing: 2) {
                HStack {
                    Text("AD \(stats.adPercent)%").foregroundColor(Color(hex: "ffae42"))
                    Spacer()
                    Text("AP \(stats.apPercent)%").foregroundColor(Color(hex: "c77dff"))
                }
                .font(.system(size: 8, weight: .bold))
                
                HStack(spacing: 0) {
                    Rectangle()
                        .fill(LinearGradient(colors: [Color(hex: "ffae42"), Color(hex: "ff7b00")], startPoint: .leading, endPoint: .trailing))
                        .frame(width: CGFloat(stats.adPercent) / 100 * 120)
                    Rectangle()
                        .fill(LinearGradient(colors: [Color(hex: "9d4edd"), Color(hex: "c77dff")], startPoint: .leading, endPoint: .trailing))
                }
                .frame(width: 120, height: 5)
                .cornerRadius(3)
                .background(Color.black.opacity(0.5))
            }
            
            // Scaling (Early / Late)
            VStack(alignment: .leading, spacing: 2) {
                HStack {
                    Text(L10n.tr("early", language)).foregroundColor(Color(hex: "00f2ff"))
                    Spacer()
                    Text(L10n.tr("late", language)).foregroundColor(Color(hex: "ff0055"))
                }
                .font(.system(size: 8, weight: .bold))
                
                ZStack(alignment: .leading) {
                    LinearGradient(colors: [Color(hex: "00f2ff"), Color(hex: "2a2a72"), Color(hex: "ff0055")], startPoint: .leading, endPoint: .trailing)
                        .frame(width: 120, height: 5)
                        .cornerRadius(3)
                    
                    Rectangle()
                        .fill(Color.white)
                        .frame(width: 3, height: 7)
                        .shadow(color: .white, radius: 2)
                        .offset(x: CGFloat(stats.timeScore) / 100 * 120 - 1.5)
                }
            }
            
            // Damage Rating
            VStack(alignment: .leading, spacing: 2) {
                HStack {
                    Text(L10n.tr("damage", language)).foregroundColor(Color(hex: "ff3333"))
                    Spacer()
                    Text(String(format: "%.1f/3", stats.damageScore))
                }
                .font(.system(size: 8, weight: .bold))
                
                ZStack(alignment: .leading) {
                    Color.black.opacity(0.5).frame(width: 120, height: 5).cornerRadius(3)
                    LinearGradient(colors: [Color(hex: "550000"), Color(hex: "ff0000")], startPoint: .leading, endPoint: .trailing)
                        .frame(width: CGFloat(stats.damagePercent) / 100 * 120, height: 5)
                        .cornerRadius(3)
                }
            }
        }
        .frame(width: 120)
    }
}

struct DraftColumnView: View {
    let title: String
    let picks: [Champion?]
    let side: DraftViewModel.SlotSelection.Side
    let activeIndex: Int?
    let onSelect: (Int) -> Void
    let onRemove: (Int) -> Void
    let language: String
    
    let roles = ["TOP", "JUNGLE", "MID", "ADC", "SUPP"]
    
    var body: some View {
        VStack {
            Text(side == .ally ? L10n.tr("ally", language) : L10n.tr("enemy", language))
                .font(.headline.bold())
                .foregroundColor(side == .ally ? Color(hex: "00FFC8") : Color(hex: "FF3366"))
                .padding(.vertical)
            
            ForEach(0..<5, id: \.self) { i in
                SlotView(
                    role: roles[i],
                    champion: picks[i],
                    isActive: activeIndex == i,
                    side: side,
                    language: language,
                    onTap: { onSelect(i) },
                    onRemove: { onRemove(i) }
                )
            }
            
            Spacer()
        }
        .background(Color(hex: "0D1B2A").opacity(0.8))
        .border(side == .ally ? Color(hex: "00FFC8").opacity(0.3) : Color(hex: "FF3366").opacity(0.3), width: 1)
    }
}

struct SlotView: View {
    let role: String
    let champion: Champion?
    let isActive: Bool
    let side: DraftViewModel.SlotSelection.Side
    let language: String
    let onTap: () -> Void
    let onRemove: () -> Void
    
    var body: some View {
        HStack {
            Image(role.lowercased())
                .renderingMode(.template)
                .resizable()
                .scaledToFit()
                .frame(width: 22, height: 22)
                .foregroundColor(Color(hex: "D4AF37"))
                .opacity(0.9)
            
            VStack(alignment: .leading) {
                Text(role)
                    .font(.caption2.bold())
                    .foregroundColor(.gray)
                Text(champion?.name ?? L10n.tr("pick", language))
                    .font(.body.bold())
                    .foregroundColor(champion == nil ? .gray.opacity(0.5) : .white)
                    .lineLimit(1)
                    .truncationMode(.tail)
            }
            
            Spacer(minLength: 12)
            
            if let champ = champion {
                AsyncImage(url: URL(string: champ.imageUrl)) { img in
                    img.resizable().scaledToFill()
                } placeholder: {
                    Color.gray.opacity(0.3)
                }
                .frame(width: 40, height: 40)
                .clipShape(Circle())
                .overlay(Circle().stroke(Color(hex: "D4AF37"), lineWidth: 1))
                
                Button(action: onRemove) {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(.red.opacity(0.8))
                        .font(.title3)
                }
                .buttonStyle(.plain)
            }
        }
        .padding()
        .background(isActive ? Color.white.opacity(0.08) : Color.white.opacity(0.02))
        .overlay(
            Rectangle()
                .frame(width: 4)
                .foregroundColor(isActive ? (side == .ally ? Color(hex: "00FFC8") : Color(hex: "FF3366")) : .clear),
            alignment: .leading
        )
        .contentShape(Rectangle())
        .onTapGesture(perform: onTap)
        .cornerRadius(8)
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(Color.white.opacity(0.06), lineWidth: 1)
        )
    }
}

struct RecommendationRow: View {
    let recommendation: Recommendation
    let language: String
    let onSelected: () -> Void
    
    var body: some View {
        Button(action: onSelected) {
            VStack(alignment: .leading, spacing: 8) {
                HStack(alignment: .top, spacing: 12) {
                    AsyncImage(url: URL(string: recommendation.champion.imageUrl)) { img in
                        img.resizable().scaledToFill()
                    } placeholder: {
                        Color.gray.opacity(0.3)
                    }
                    .frame(width: 50, height: 50)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                    
                    VStack(alignment: .leading, spacing: 4) {
                        HStack {
                            Text(recommendation.champion.name)
                                .font(.headline)
                                .lineLimit(1)
                            Spacer(minLength: 8)
                            TierBadge(tier: recommendation.tierName)
                        }
                        
                        // Champion.description is LocalizedText; call .get directly
                        Text(recommendation.champion.description.get(language))
                            .font(.caption)
                            .foregroundColor(.gray)
                            .lineLimit(2)
                    }
                    
                    VStack(alignment: .trailing, spacing: 2) {
                        Text(String(format: "%.1f", recommendation.totalScore))
                            .font(.title3.bold())
                            .foregroundColor(Color(hex: "D4AF37"))
                        Text(L10n.tr("score", language))
                            .font(.caption2)
                            .foregroundColor(.gray)
                    }
                }
                
                if !recommendation.synergyExplanations.isEmpty {
                    Divider().opacity(0.1)
                    ForEach(recommendation.synergyExplanations.prefix(2), id: \.self) { exp in
                        HStack(alignment: .top, spacing: 6) {
                            Text("•").foregroundColor(Color(hex: "00FFC8"))
                            Text(exp).font(.caption).foregroundColor(.gray)
                        }
                    }
                }
                
                if !recommendation.counterExplanations.isEmpty {
                    Divider().opacity(0.1)
                    ForEach(recommendation.counterExplanations.prefix(2), id: \.self) { exp in
                        HStack(alignment: .top, spacing: 6) {
                            Text("⚔").font(.caption)
                            Text(exp).font(.caption).foregroundColor(.gray)
                        }
                    }
                }
                
                if !recommendation.vulnerabilityExplanations.isEmpty {
                    Divider().opacity(0.1)
                    ForEach(recommendation.vulnerabilityExplanations.prefix(1), id: \.self) { exp in
                        HStack(alignment: .top, spacing: 6) {
                            Text("⚠️").font(.caption)
                            Text(exp).font(.caption).foregroundColor(.red.opacity(0.7))
                        }
                    }
                }
            }
            .padding()
            .background(Color.white.opacity(0.05))
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color(hex: "D4AF37").opacity(0.15), lineWidth: 1)
            )
        }
        .buttonStyle(PlainButtonStyle())
    }
}

struct TierBadge: View {
    let tier: String
    
    var body: some View {
        Text(tier)
            .font(.caption.bold())
            .padding(.horizontal, 8)
            .padding(.vertical, 2)
            .background(tierColor.opacity(0.2))
            .foregroundColor(tierColor)
            .cornerRadius(4)
            .overlay(RoundedRectangle(cornerRadius: 4).stroke(tierColor, lineWidth: 1))
    }
    
    var tierColor: Color {
        switch tier {
        case "S+": return .orange
        case "S": return .yellow
        case "A": return .green
        case "B": return .blue
        case "C": return .purple
        default: return .gray
        }
    }
}

struct RoleSelectorView: View {
    @Binding var selectedRole: String
    let onChange: () -> Void
    
    let roles = ["top", "jungle", "mid", "adc", "support"]
    
    var body: some View {
        HStack(spacing: 8) {
            ForEach(roles, id: \.self) { role in
                Button(action: {
                    selectedRole = role
                    onChange()
                }) {
                    Image(role.lowercased())
                        .renderingMode(.template)
                        .resizable()
                        .scaledToFit()
                        .frame(width: 20, height: 20)
                        .padding(6)
                        .background(selectedRole == role ? Color(hex: "D4AF37") : Color.white.opacity(0.1))
                        .foregroundColor(selectedRole == role ? .black : .white)
                        .clipShape(Circle())
                }
                .buttonStyle(PlainButtonStyle())
            }
        }
    }
}

// Helper pour couleurs hex
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - Counter Lookup View (New Page)
struct CounterLookupView: View {
    @ObservedObject var viewModel: DraftViewModel
    let language: String
    @State private var showingPicker = false
    
    var body: some View {
        VStack(spacing: 0) {
            // Target Selection Area
            VStack(spacing: 16) {
                Text(L10n.tr("who_to_counter", language))
                    .font(.custom("Avenir-Black", size: 16))
                    .foregroundColor(Color(hex: "D4AF37"))
                    .padding(.top)
                
                HStack(spacing: 20) {
                    // Selected Champion
                    Button {
                        showingPicker = true
                    } label: {
                        VStack {
                            if let target = viewModel.lookupTarget {
                                AsyncImage(url: URL(string: target.imageUrl)) { img in
                                    img.resizable().scaledToFill()
                                } placeholder: {
                                    Color.gray
                                }
                                .frame(width: 80, height: 80)
                                .clipShape(RoundedRectangle(cornerRadius: 12))
                                .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color(hex: "D4AF37"), lineWidth: 2))
                                
                                Text(target.name)
                                    .font(.headline.bold())
                                    .foregroundColor(.white)
                            } else {
                                RoundedRectangle(cornerRadius: 12)
                                    .fill(Color.white.opacity(0.1))
                                    .frame(width: 80, height: 80)
                                    .overlay(Image(systemName: "plus").foregroundColor(.gray))
                                
                                Text(L10n.tr("select_champion_prompt", language))
                                    .font(.caption.bold())
                                    .foregroundColor(.gray)
                            }
                        }
                    }
                    .buttonStyle(.plain)
                    
                    Image(systemName: "arrow.right")
                        .font(.title.bold())
                        .foregroundColor(Color(hex: "D4AF37"))
                    
                    // Role Selection
                    VStack(alignment: .leading) {
                        Text(L10n.tr("on_role", language))
                            .font(.caption2.bold())
                            .foregroundColor(.gray)
                        
                        RoleSelectorView(
                            selectedRole: Binding(
                                get: { viewModel.lookupRole },
                                set: { viewModel.lookupRole = $0; viewModel.updateLookupResults() }
                            )
                        ) {
                            viewModel.updateLookupResults()
                        }
                    }
                }
                .padding()
                .background(Color.white.opacity(0.05))
                .cornerRadius(16)
                .overlay(RoundedRectangle(cornerRadius: 16).stroke(Color.white.opacity(0.1), lineWidth: 1))
            }
            .padding()
            .background(Color(hex: "0D1B2A"))
            
            // Results List
            if viewModel.lookupTarget == nil {
                Spacer()
                VStack(spacing: 20) {
                    Image(systemName: "person.fill.questionmark")
                        .font(.system(size: 60))
                        .foregroundColor(.gray.opacity(0.3))
                    Text(L10n.tr("choose_to_see_counters", language))
                        .foregroundColor(.gray)
                }
                Spacer()
            } else {
                List {
                    Section(header: Text("\(L10n.tr("best_counters_for", language)) \(viewModel.lookupTarget?.name.uppercased() ?? "")")) {
                        ForEach(viewModel.lookupResults) { rec in
                            RecommendationRow(recommendation: rec, language: language) {
                                // Preview only
                            }
                            .listRowBackground(Color.clear)
                            .listRowInsets(EdgeInsets(top: 4, leading: 16, bottom: 4, trailing: 16))
                        }
                    }
                }
                .listStyle(.grouped)
                .scrollContentBackground(.hidden)
                .background(Color(hex: "050A0F"))
            }
        }
        .navigationTitle(L10n.tr("counters_tab", language))
        .navigationBarTitleDisplayMode(.inline)
        .sheet(isPresented: $showingPicker) {
            ChampionPickerModal(viewModel: viewModel, language: language)
        }
    }
}

// Simple Champion Picker Modal
struct ChampionPickerModal: View {
    @ObservedObject var viewModel: DraftViewModel
    let language: String
    @Environment(\.dismiss) var dismiss
    @State private var searchText = ""
    
    var filteredChampions: [Champion] {
        if searchText.isEmpty { return viewModel.engine.champions }
        return viewModel.engine.champions.filter { $0.name.lowercased().contains(searchText.lowercased()) }
    }
    
    var body: some View {
        NavigationStack {
            VStack {
                TextField(L10n.tr("search_placeholder", language), text: $searchText)
                    .padding(10)
                    .background(Color.white.opacity(0.1))
                    .cornerRadius(8)
                    .padding()
                
                ScrollView {
                    LazyVGrid(columns: [GridItem(.adaptive(minimum: 80))], spacing: 16) {
                        ForEach(filteredChampions) { champ in
                            Button {
                                viewModel.lookupTarget = champ
                                viewModel.updateLookupResults()
                                dismiss()
                            } label: {
                                VStack {
                                    AsyncImage(url: URL(string: champ.imageUrl)) { img in
                                        img.resizable().scaledToFill()
                                    } placeholder: {
                                        Color.gray
                                    }
                                    .frame(width: 60, height: 60)
                                    .clipShape(Circle())
                                    
                                    Text(champ.name)
                                        .font(.caption.bold())
                                        .foregroundColor(.white)
                                        .lineLimit(1)
                                }
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding()
                }
            }
            .background(Color(hex: "050A0F"))
            .navigationTitle(L10n.tr("select_target", language))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(L10n.tr("done", language)) { dismiss() }
                }
            }
        }
    }
}
