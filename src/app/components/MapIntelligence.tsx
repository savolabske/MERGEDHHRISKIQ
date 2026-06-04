import {
  History,
  SendHorizontal,
  Tent,
  Shield,
  CloudRain,
  AlertTriangle,
  ChevronRight,
  PanelRightClose,
  PanelRightOpen,
  X,
  Clock3,
  MessageSquareText,
  ArrowLeft,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const riskPrompts = [
  {
    text: "Can you show me IDP camps near Mogadishu?",
    icon: Tent,
    iconClass: "text-primary",
    iconBgClass: "bg-primary-subtle",
  },
  {
    text: "Which districts currently have the highest aid diversion risk?",
    icon: Shield,
    iconClass: "text-warning-strong",
    iconBgClass: "bg-warning-subtle",
  },
  {
    text: "Which areas in Somalia look most exposed to drought over the next 90 days?",
    icon: CloudRain,
    iconClass: "text-destructive",
    iconBgClass: "bg-destructive-subtle",
  },
  {
    text: "Where are recent security incidents in Somalia?",
    icon: AlertTriangle,
    iconClass: "text-destructive-text",
    iconBgClass: "bg-destructive-subtle",
  },
];

type RiskArea = {
  name: string;
  aliases: string[];
  center: [number, number];
  polygon: [number, number][];
  riskLevel: "High" | "Medium" | "Stable";
  defaultHotspotLabel: string;
};

type QueryVisualizationResult = {
  summary: string;
  assistantText: string;
  visualMode: "mixed" | "markers" | "zones" | "routes";
  matchedAreas: RiskArea[];
  markers: {
    name: string;
    description: string;
    coords: [number, number];
    color: string;
  }[];
  zones: {
    name: string;
    description: string;
    color: string;
    fillOpacity: number;
    polygon?: [number, number][];
    center?: [number, number];
    radius?: number;
  }[];
  routes: {
    name: string;
    description: string;
    color: string;
    path: [number, number][];
  }[];
  legendTitle: string;
  legendItems: string[];
  responseCard?: {
    title: string;
    intro: string;
    highlights: string[];
    sections?: { title: string; items: string[] }[];
    sourceNote?: string;
  };
  secondaryList?: {
    title: string;
    items: {
      id: string;
      name: string;
      subtitle: string;
      value: string;
      coords: [number, number];
      color: string;
    }[];
  };
};

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

const buildMapPinIconHtml = (color: string) => `
  <div style="position:relative;width:24px;height:34px;">
    <svg viewBox="0 0 24 34" width="24" height="34" aria-hidden="true" focusable="false">
      <path
        d="M12 1.5C6.6 1.5 2.2 5.9 2.2 11.3c0 7.6 8.3 18.4 9.2 19.6a.8.8 0 0 0 1.2 0c.9-1.2 9.2-12 9.2-19.6C21.8 5.9 17.4 1.5 12 1.5z"
        fill="${color}"
        stroke="var(--foreground-emphasis)"
        stroke-opacity="0.35"
        stroke-width="1.1"
      />
      <circle cx="12" cy="11.3" r="4.5" fill="var(--foreground-emphasis)" fill-opacity="0.8" />
    </svg>
  </div>
`;

const renderInlineFormatting = (text: string, keyPrefix: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, partIndex) => {
    const isBold = part.startsWith("**") && part.endsWith("**") && part.length > 4;
    const value = isBold ? part.slice(2, -2) : part;
    return isBold ? (
      <strong key={`${keyPrefix}-part-${partIndex}`} className="font-semibold text-foreground-emphasis">
        {value}
      </strong>
    ) : (
      <span key={`${keyPrefix}-part-${partIndex}`}>{value}</span>
    );
  });
};

const renderAssistantMessage = (content: string) => {
  const sections = content
    .split(/\n{2,}/)
    .map((section) => section.trim())
    .filter(Boolean);

  return (
    <div className="space-y-3.5">
      {sections.map((section, sectionIndex) => {
        const lines = section.split("\n").map((line) => line.trimEnd());
        const nonEmptyLines = lines.filter((line) => line.trim().length > 0);
        const bulletLines = nonEmptyLines.filter((line) => line.trim().startsWith("- "));
        const isBulletSection = nonEmptyLines.length > 0 && bulletLines.length === nonEmptyLines.length;

        if (isBulletSection) {
          return (
            <ul key={`section-${sectionIndex}`} className="list-disc space-y-1.5 pl-5 text-sm leading-6 marker:text-muted-foreground">
              {bulletLines.map((line, lineIndex) => (
                <li key={`section-${sectionIndex}-bullet-${lineIndex}`} className="text-secondary-foreground">
                  {renderInlineFormatting(line.replace(/^- /, ""), `section-${sectionIndex}-bullet-${lineIndex}`)}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <div key={`section-${sectionIndex}`} className="space-y-1.5">
            {nonEmptyLines.map((line, lineIndex) => {
              const isSectionTitle = line.endsWith(":");
              return (
                <p
                  key={`section-${sectionIndex}-line-${lineIndex}`}
                  className={`text-sm leading-6 ${
                    isSectionTitle ? "font-semibold text-foreground-emphasis" : "text-secondary-foreground"
                  }`}
                >
                  {renderInlineFormatting(line, `section-${sectionIndex}-line-${lineIndex}`)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

const riskAreas: RiskArea[] = [
  {
    name: "Mogadishu",
    aliases: ["mogadishu", "banadir"],
    center: [2.0469, 45.3182],
    polygon: [
      [2.14, 45.23],
      [2.12, 45.42],
      [1.98, 45.48],
      [1.92, 45.28],
    ],
    riskLevel: "High",
    defaultHotspotLabel: "Urban access bottleneck",
  },
  {
    name: "Baidoa",
    aliases: ["baidoa", "bay region", "bay"],
    center: [3.1167, 43.65],
    polygon: [
      [3.24, 43.52],
      [3.22, 43.78],
      [3.03, 43.84],
      [2.98, 43.6],
    ],
    riskLevel: "Medium",
    defaultHotspotLabel: "Aid diversion pressure point",
  },
  {
    name: "Kismayo",
    aliases: ["kismayo", "lower juba", "jubaland"],
    center: [-0.3582, 42.5454],
    polygon: [
      [-0.22, 42.41],
      [-0.18, 42.67],
      [-0.44, 42.78],
      [-0.56, 42.5],
    ],
    riskLevel: "Stable",
    defaultHotspotLabel: "Logistics corridor watchpoint",
  },
];

const keyLocations: Record<string, [number, number]> = {
  Mogadishu: [2.0469, 45.3182],
  Baidoa: [3.1167, 43.65],
  Kismayo: [-0.3582, 42.5454],
  Jowhar: [2.7809, 45.5005],
  Beledweyne: [4.7358, 45.2036],
  Dollow: [4.1833, 42.0833],
  Hargeisa: [9.56, 44.065],
  Garowe: [8.4054, 48.4845],
  Marka: [1.7159, 44.7717],
};

type CampSettlementTemplate = {
  name: string;
  distanceKm: number;
  population: number;
  offsetLat: number;
  offsetLng: number;
};

const haversineDistanceKm = (a: [number, number], b: [number, number]) => {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(b[0] - a[0]);
  const deltaLng = toRadians(b[1] - a[1]);
  const lat1 = toRadians(a[0]);
  const lat2 = toRadians(b[0]);

  const sinLat = Math.sin(deltaLat / 2);
  const sinLng = Math.sin(deltaLng / 2);
  const h =
    sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
  return 2 * earthRadiusKm * Math.asin(Math.sqrt(h));
};

const inferQueryVisualization = (query: string, intentQuery?: string): QueryVisualizationResult => {
  const normalized = query.toLowerCase();
  const intentNormalized = (intentQuery ?? query).toLowerCase();
  const matchedAreas = riskAreas.filter((area) =>
    area.aliases.some((alias) => normalized.includes(alias))
  );
  const resolvedAreas = matchedAreas.length > 0 ? matchedAreas : riskAreas;
  const areaNames = resolvedAreas.map((area) => area.name);

  const isCampDomain =
    normalized.includes("idp") ||
    normalized.includes("camp") ||
    normalized.includes("refugee");
  const isCampIntent =
    intentNormalized.includes("idp") ||
    intentNormalized.includes("camp") ||
    intentNormalized.includes("refugee");
  const isProjectQuery =
    intentNormalized.includes("unicef") ||
    intentNormalized.includes("project") ||
    intentNormalized.includes("program");
  const isDiversionQuery =
    intentNormalized.includes("diversion") ||
    intentNormalized.includes("aid diversion") ||
    intentNormalized.includes("checkpoint");
  const isSecurityQuery =
    intentNormalized.includes("security incident") ||
    intentNormalized.includes("security incidents") ||
    intentNormalized.includes("security") ||
    intentNormalized.includes("incident") ||
    intentNormalized.includes("attack") ||
    intentNormalized.includes("ied") ||
    intentNormalized.includes("clash");
  const isDroughtQuery =
    intentNormalized.includes("drought") ||
    intentNormalized.includes("hunger") ||
    intentNormalized.includes("food insecurity") ||
    intentNormalized.includes("ipc");
  const isRouteQuery =
    intentNormalized.includes("route") ||
    intentNormalized.includes("corridor") ||
    intentNormalized.includes("path") ||
    intentNormalized.includes("road");
  const isTemporalActivityQuery =
    intentNormalized.includes("last 6 months") ||
    intentNormalized.includes("last six months") ||
    intentNormalized.includes("stayed active") ||
    intentNormalized.includes("active in the last");
  const isDiversionTrendQuery =
    intentNormalized.includes("increased") ||
    intentNormalized.includes("increase most") ||
    intentNormalized.includes("last 3 months") ||
    intentNormalized.includes("last three months") ||
    intentNormalized.includes("trend");
  const isServiceGapQuery =
    intentNormalized.includes("service gap") ||
    intentNormalized.includes("largest service gaps");
  const isSecurityPersistenceQuery =
    isSecurityQuery &&
    (intentNormalized.includes("remained active") || intentNormalized.includes("last 6 months"));
  const isRouteDiversionOverlayQuery =
    isRouteQuery &&
    (intentNormalized.includes("affected") || intentNormalized.includes("diversion hotspot"));
  const isRouteAlternativeQuery =
    isRouteQuery &&
    (intentNormalized.includes("alternative route") || intentNormalized.includes("lower risk"));
  const isDroughtDisplacementOverlayQuery =
    isDroughtQuery && (intentNormalized.includes("displacement pressure") || intentNormalized.includes("overlay displacement"));
  const isDroughtPriorityQuery =
    isDroughtQuery && (intentNormalized.includes("prioritized first") || intentNormalized.includes("prioritize first"));

  if (isCampIntent || (isCampDomain && !isRouteQuery && !isDiversionQuery && !isSecurityQuery && !isDroughtQuery)) {
    const focus = matchedAreas[0]?.name || "Mogadishu";
    const focusCoords = keyLocations[focus] || keyLocations.Mogadishu;
    const campSettlementsByFocus: Record<string, CampSettlementTemplate[]> = {
      Mogadishu: [
        {
          name: "Dayniile Camp Cluster",
          distanceKm: 18,
          population: 52000,
          offsetLat: 0.11,
          offsetLng: -0.08,
        },
        {
          name: "Kahda Camp Cluster",
          distanceKm: 24,
          population: 48000,
          offsetLat: -0.09,
          offsetLng: -0.13,
        },
        {
          name: "Wadajir Camp Cluster",
          distanceKm: 16,
          population: 46000,
          offsetLat: -0.04,
          offsetLng: 0.07,
        },
        {
          name: "Deynile Peri-Urban Sites",
          distanceKm: 31,
          population: 44000,
          offsetLat: 0.21,
          offsetLng: -0.19,
        },
        {
          name: "Afgooye Displacement Belt",
          distanceKm: 43,
          population: 47600,
          offsetLat: 0.14,
          offsetLng: -0.34,
        },
        {
          name: "Warshiekh Transition Sites",
          distanceKm: 58,
          population: 16200,
          offsetLat: 0.40,
          offsetLng: 0.26,
        },
      ],
      Baidoa: [
        {
          name: "Bur Hakaba Perimeter",
          distanceKm: 18,
          population: 10300,
          offsetLat: 0.12,
          offsetLng: -0.10,
        },
        {
          name: "Bardhere Displacement Catchment",
          distanceKm: 36,
          population: 9200,
          offsetLat: 0.28,
          offsetLng: 0.06,
        },
        {
          name: "Bay Region Settlement Belt",
          distanceKm: 29,
          population: 12500,
          offsetLat: 0.16,
          offsetLng: -0.18,
        },
        {
          name: "Riverside Transfer Points",
          distanceKm: 24,
          population: 8600,
          offsetLat: -0.02,
          offsetLng: 0.12,
        },
        {
          name: "Bakool Spillover Sites",
          distanceKm: 41,
          population: 7700,
          offsetLat: 0.36,
          offsetLng: -0.26,
        },
        {
          name: "South-West Access Spur",
          distanceKm: 46,
          population: 11100,
          offsetLat: -0.06,
          offsetLng: 0.22,
        },
      ],
      Kismayo: [
        {
          name: "Afmadow Settlement Spur",
          distanceKm: 28,
          population: 9800,
          offsetLat: 0.10,
          offsetLng: 0.30,
        },
        {
          name: "Garas-district Peri-Urban Sites",
          distanceKm: 34,
          population: 11900,
          offsetLat: -0.04,
          offsetLng: 0.10,
        },
        {
          name: "Lower Juba Corridor Camps",
          distanceKm: 21,
          population: 10200,
          offsetLat: 0.20,
          offsetLng: -0.05,
        },
        {
          name: "Bardera Transfer Lines",
          distanceKm: 49,
          population: 7600,
          offsetLat: 0.35,
          offsetLng: -0.18,
        },
        {
          name: "Logistics Edge Sites (Kismayo Basin)",
          distanceKm: 16,
          population: 13300,
          offsetLat: -0.14,
          offsetLng: -0.06,
        },
        {
          name: "Coastal Access Settlements",
          distanceKm: 39,
          population: 8900,
          offsetLat: -0.10,
          offsetLng: -0.30,
        },
      ],
    };

    const settlements = campSettlementsByFocus[focus] ?? campSettlementsByFocus.Mogadishu;
    const analysisRadiusKm = 50;

    const nearbyCamps = settlements.map((s) => ({
      name: s.name,
      description: `${s.distanceKm}km | ${s.population.toLocaleString()} people`,
      coords: [focusCoords[0] + s.offsetLat, focusCoords[1] + s.offsetLng] as [number, number],
      color: "var(--primary)",
    }));
    const nearbyCampsWithDistance = nearbyCamps.map((camp) => ({
      ...camp,
      distanceFromFocusKm: haversineDistanceKm(focusCoords, camp.coords),
    }));
    const nearbyCampsWithinRadius = nearbyCampsWithDistance.filter(
      (camp) => camp.distanceFromFocusKm <= analysisRadiusKm
    );
    const visibleSettlements = settlements.filter(
      (_, idx) => nearbyCampsWithDistance[idx]?.distanceFromFocusKm <= analysisRadiusKm
    );
    const totalPeople = visibleSettlements.reduce((sum, s) => sum + s.population, 0);

    if (isServiceGapQuery) {
      const gapMarkers = nearbyCampsWithinRadius.map((camp, idx) => ({
        ...camp,
        color: idx % 3 === 0 ? "var(--destructive-text)" : idx % 3 === 1 ? "var(--warning-strong)" : "var(--warning)",
        description: `${camp.description} | ${
          idx % 3 === 0 ? "Severe WASH/Health gap" : idx % 3 === 1 ? "Moderate Shelter/Food gap" : "Localized service gap"
        }`,
      }));

      return {
        summary: `Service-gap overlay applied to camps around ${focus}.`,
        assistantText:
          `**Service gaps across currently shown camps near ${focus}**\n\n` +
          `This refinement keeps the same camp set and reclassifies each site by service shortfall severity.\n\n` +
          `Of the ${gapMarkers.length} camps shown, ${gapMarkers.filter((m) => m.color === "var(--destructive-text)").length} are severe-priority for immediate multi-sector support.`,
        visualMode: "markers",
        matchedAreas: resolvedAreas,
        markers: gapMarkers,
        zones: [],
        routes: [],
        legendTitle: "CAMP SERVICE GAPS",
        legendItems: ["Severe gap", "Moderate gap", "Localized gap"],
        secondaryList: {
          title: "Camp Service Gaps",
          items: gapMarkers.map((marker, idx) => ({
            id: `${focus.toLowerCase()}-gap-${idx}`,
            name: marker.name,
            subtitle: marker.description,
            value: marker.color === "var(--destructive-text)" ? "Severe" : marker.color === "var(--warning-strong)" ? "Moderate" : "Localized",
            coords: marker.coords,
            color: marker.color,
          })),
        },
      };
    }

    if (isTemporalActivityQuery) {
      const activityBand = ["6m active", "5m active", "4m active", "3m active"];
    const activeThresholdKm = 32;
    const temporalMarkers = nearbyCampsWithDistance
      .filter((camp) => camp.distanceFromFocusKm <= analysisRadiusKm)
      .map((camp, idx) => {
        const isActive = camp.distanceFromFocusKm <= activeThresholdKm;
        return {
          ...camp,
          isActive,
          activityTag: isActive ? activityBand[idx % activityBand.length] : "Inactive in last 6m",
          color: isActive
            ? idx % 3 === 0
              ? "var(--destructive)"
              : idx % 3 === 1
                ? "var(--warning-strong)"
                : "var(--warning)"
            : "var(--text-subtle)",
          description: `${camp.description} | ${
            isActive ? activityBand[idx % activityBand.length] : "Inactive in last 6m"
          }`,
        };
      });
    const activeCount = temporalMarkers.filter((marker) => marker.isActive).length;
    const totalShown = temporalMarkers.length;

      return {
        summary: `Activity-filtered IDP sites layered for ${focus} (last 6 months).`,
        assistantText:
          `**IDP sites with sustained activity in the last 6 months near ${focus}**\n\n` +
          `This layer highlights the camps with persistent movement and service demand across the last two quarters.\n\n` +
        `Of the ${totalShown} camps shown, ${activeCount} have remained active in the last 6 months. Active sites stay highlighted while less active sites are dimmed for context.`,
        visualMode: "mixed",
        matchedAreas: resolvedAreas,
        markers: temporalMarkers,
        zones: [
          {
            name: `${focus} sustained-activity radius`,
            description: "Last 6 months activity footprint around primary focus",
            color: "var(--warning-strong)",
            fillOpacity: 0.18,
            center: focusCoords,
            radius: analysisRadiusKm * 1000,
          },
        ],
        routes: [],
        legendTitle: "IDP ACTIVITY TREND",
      legendItems: ["Active (6m sustained)", "Recent (4-5m sustained)", "Dimmed (inactive in last 6m)", "Analysis radius"],
        secondaryList: {
          title: "Sustained Activity Sites",
          items: temporalMarkers.map((marker, idx) => ({
            id: `${focus.toLowerCase()}-active-${idx}`,
            name: marker.name,
            subtitle: marker.description,
          value: marker.activityTag,
            coords: marker.coords,
            color: marker.color,
          })),
        },
      };
    }

    const concentrationContext: Record<string, string> = {
      Mogadishu:
        "Refugee and IDP sites near Mogadishu are concentrated in Dayniile, Kahda, and Wadajir districts.",
      Baidoa:
        "Refugee and IDP sites near Baidoa are concentrated along Bur Hakaba, Bay settlement belts, and key transfer points.",
      Kismayo:
        "Refugee and IDP sites near Kismayo are concentrated across Lower Juba corridor settlements and peri-urban camp belts.",
    };

    return {
      summary: `Refugee and IDP camps highlighted around ${focus}.`,
      assistantText:
        `**IDP and refugee camp activity around ${focus}**\n\n` +
        `${concentrationContext[focus] ?? `Refugee and IDP sites near ${focus} are concentrated along key movement corridors and peri-urban access belts.`}\n\n` +
        `There are approximately ${totalPeople.toLocaleString()} displaced persons across ${visibleSettlements.length} active camps within a ${analysisRadiusKm}km radius of ${focus} city center.\n\n` +
        `The active camps are listed below for quick review.`,
      visualMode: "markers",
      matchedAreas: resolvedAreas,
      markers: nearbyCampsWithinRadius,
      zones: [
        {
          name: `${focus} ${analysisRadiusKm}km radius`,
          description: `Primary analysis radius | ~${totalPeople.toLocaleString()} affected population represented`,
          color: "var(--primary)",
          fillOpacity: 0.12,
          center: focusCoords,
          radius: analysisRadiusKm * 1000,
        },
      ],
      routes: [],
      legendTitle: "REFUGEE / IDP CAMPS",
      legendItems: ["Settlement cluster point", "50km analysis radius", "Potential camp spillover zone"],
      responseCard: {
        title: `Refugee & IDP Camps Near ${focus}`,
        intro: `${focus} has visible concentration of displacement settlements along key access corridors with high demand for coordinated services.`,
        highlights: [
          `${visibleSettlements.length} active camp clusters mapped`,
          `~${totalPeople.toLocaleString()} displaced persons across visible sites`,
          "Highest density appears along peri-urban movement corridors",
        ],
        sections: [
          {
            title: "Key Concentrations",
            items: [
              `${visibleSettlements[0]?.name ?? "Primary corridor cluster"} - largest displacement footprint`,
              `${visibleSettlements[1]?.name ?? "Secondary settlement belt"} - rapidly growing population pressure`,
              `${visibleSettlements[2]?.name ?? "Inner-ring camp zone"} - closest concentration to city center`,
            ],
          },
          {
            title: "Service Coverage",
            items: [
              "Health facilities are unevenly distributed across sites",
              "WASH access remains below recommended standards in outer camps",
              "Education and protection services are concentrated in a few settlements",
            ],
          },
        ],
        sourceNote: "Data source: UNHCR / IOM DTM - Last updated: February 2026",
      },
      secondaryList: {
        title: "Camps & Settlements",
        items: visibleSettlements.map((s, idx) => ({
          id: `${focus.toLowerCase()}-camp-${idx}`,
          name: s.name,
          subtitle: `${s.distanceKm}km - ${
            idx % 3 === 0 ? "Health, WASH, Food" : idx % 3 === 1 ? "Food, Shelter, WASH" : "Health, Protection"
          }`,
          value: `${(s.population / 1000).toFixed(1)}K`,
          coords: [focusCoords[0] + s.offsetLat, focusCoords[1] + s.offsetLng],
          color: "var(--info)",
        })),
      },
    };
  }

  if (isRouteQuery) {
    const routes = [
      {
        name: "Mogadishu - Baidoa corridor",
        description: "Main overland logistics path",
        color: "var(--primary)",
        path: [keyLocations.Mogadishu, [2.56, 44.9] as [number, number], keyLocations.Baidoa],
      },
      {
        name: "Mogadishu - Jowhar corridor",
        description: "Primary northbound humanitarian route",
        color: "var(--primary)",
        path: [keyLocations.Mogadishu, [2.37, 45.38] as [number, number], keyLocations.Jowhar],
      },
      {
        name: "Baidoa - Kismayo support route",
        description: "South-west secondary access line",
        color: "var(--primary)",
        path: [keyLocations.Baidoa, [1.35, 43.22] as [number, number], keyLocations.Kismayo],
      },
      {
        name: "Mogadishu - Afgooye checkpoint stretch",
        description: "High-friction checkpoint segment",
        color: "var(--warning-strong)",
        path: [keyLocations.Mogadishu, [2.01, 45.08] as [number, number], [1.92, 44.91] as [number, number]],
      },
    ];

    if (isRouteDiversionOverlayQuery) {
      const overlayZones = [
        {
          name: "Mogadishu-Jowhar route nodes",
          description: "High diversion pressure on convoy checkpoints",
          color: "var(--destructive)",
          fillOpacity: 0.26,
          center: [2.28, 45.26] as [number, number],
          radius: 17000,
        },
        {
          name: "Baidoa feeder segment",
          description: "Moderate diversion pressure around feeder roads",
          color: "var(--warning-strong)",
          fillOpacity: 0.22,
          center: [2.78, 43.98] as [number, number],
          radius: 15000,
        },
      ];

      return {
        summary: "Affected supply routes now overlaid with diversion pressure points.",
        assistantText:
          "**Supply routes affected by diversion hotspots**\n\n" +
          "Corridors remain visible, with hotspot overlays added on the route segments facing the highest diversion pressure.\n\n" +
          `Of ${routes.length} active corridors shown, 2 are currently flagged as diversion-affected priority segments.`,
        visualMode: "mixed",
        matchedAreas: resolvedAreas,
        markers: [],
        zones: overlayZones,
        routes,
        legendTitle: "ROUTE + DIVERSION OVERLAY",
        legendItems: ["Primary corridor", "Secondary corridor", "Diversion-affected segment"],
        secondaryList: {
          title: "Affected Corridor Segments",
          items: routes.map((route, idx) => ({
            id: `affected-route-${idx}`,
            name: route.name,
            subtitle: idx < 2 ? "Diversion-affected segment" : route.description,
            value: idx < 2 ? "Affected" : "Monitor",
            coords: route.path[Math.floor(route.path.length / 2)],
            color: idx < 2 ? "var(--destructive)" : route.color,
          })),
        },
      };
    }

    if (isRouteAlternativeQuery) {
      const altRoutes = routes.map((route, idx) => ({
        ...route,
        color: idx === 3 ? "var(--destructive)" : idx === 2 ? "var(--warning)" : "var(--success)",
      }));
      return {
        summary: "Alternative route risk ranking applied to active corridors.",
        assistantText:
          "**Lower-risk alternatives across active corridors**\n\n" +
          "This view re-ranks current corridors by comparative risk so dispatch teams can shift movement windows.\n\n" +
          `Of ${altRoutes.length} corridors shown, 2 are lower-risk alternatives and 1 remains high-friction.`,
        visualMode: "routes",
        matchedAreas: resolvedAreas,
        markers: [],
        zones: [],
        routes: altRoutes,
        legendTitle: "CORRIDOR RISK RANKING",
        legendItems: ["Lower-risk alternative", "Moderate risk", "High-friction route"],
        secondaryList: {
          title: "Route Risk Ranking",
          items: altRoutes.map((route, idx) => ({
            id: `alt-route-${idx}`,
            name: route.name,
            subtitle: route.description,
            value: route.color === "var(--success)" ? "Lower risk" : route.color === "var(--warning)" ? "Moderate" : "High",
            coords: route.path[Math.floor(route.path.length / 2)],
            color: route.color,
          })),
        },
      };
    }

    return {
      summary: "Supply and access routes highlighted with corridor links.",
      assistantText:
        "**Humanitarian Access Corridors Around Key Hubs**\n\n" +
        "Primary movement is concentrated on the Mogadishu-Baidoa and Mogadishu-Jowhar corridors, with a secondary support line between Baidoa and Kismayo.\n\n" +
        "A checkpoint-heavy segment west of Mogadishu is also mapped as a high-friction access point.\n\n" +
        "The corridor list is shown below for route-level monitoring.",
      visualMode: "routes",
      matchedAreas: resolvedAreas,
      markers: [],
      zones: [],
      routes,
      legendTitle: "ACCESS ROUTES",
      legendItems: ["Primary humanitarian route", "Secondary support route", "High-friction checkpoint segment"],
      secondaryList: {
        title: "Active Corridors",
        items: routes.map((route, idx) => ({
          id: `corridor-${idx}`,
          name: route.name,
          subtitle: route.description,
          value: route.description.includes("High-friction") ? "High-friction" : idx < 2 ? "Primary" : "Secondary",
          coords: route.path[Math.floor(route.path.length / 2)],
          color: route.color,
        })),
      },
    };
  }

  if (isProjectQuery) {
    const markers = [
      { name: "School Feeding & Education", description: "Hargeisa - Education", coords: keyLocations.Hargeisa, color: "var(--primary)" },
      { name: "Child Protection Services", description: "Kismayo - Protection", coords: keyLocations.Kismayo, color: "var(--primary)" },
      { name: "Nutrition Stabilization Centers", description: "Beledweyne - Nutrition", coords: keyLocations.Beledweyne, color: "var(--primary)" },
      { name: "Multi-Sector IDP Response", description: "Garowe - Multi-sector", coords: keyLocations.Garowe, color: "var(--primary)" },
      { name: "Community WASH Infrastructure", description: "Qalqayo corridor - WASH", coords: [6.7697, 47.4308] as [number, number], color: "var(--primary)" },
      { name: "Mobile Health & Vaccination", description: "Dollow - Health", coords: keyLocations.Dollow, color: "var(--primary)" },
      { name: "Education in Emergencies", description: "Jowhar - Education", coords: keyLocations.Jowhar, color: "var(--primary)" },
      { name: "Integrated Nutrition Program", description: "Marka - Nutrition", coords: keyLocations.Marka, color: "var(--primary)" },
    ];

    return {
      summary: "UNICEF and partner projects mapped across operational hubs.",
      assistantText:
        "**UNICEF & Partner Program Coverage Across Somalia**\n\n" +
        "Program activity is distributed across northern (Hargeisa, Garowe), central (Beledweyne, Jowhar), and southern hubs (Kismayo, Marka).\n\n" +
        "There are 8 active sites currently mapped across Health, WASH, Nutrition, Education, and Protection sectors.\n\n" +
        "The active program sites are listed below for quick review.",
      visualMode: "markers",
      matchedAreas: resolvedAreas,
      markers,
      zones: [],
      routes: [],
      legendTitle: "UNICEF PROJECTS",
      legendItems: ["Health & Nutrition", "WASH", "Education", "Protection", "Multi-sector"],
      secondaryList: {
        title: "Program Sites",
        items: markers.map((marker, idx) => ({
          id: `program-${idx}`,
          name: marker.name,
          subtitle: marker.description,
          value: "Active",
          coords: marker.coords,
          color: marker.color,
        })),
      },
    };
  }

  if (isSecurityQuery) {
    if (isSecurityPersistenceQuery) {
      const persistentZones = [
        {
          name: "Jowhar Access Belt - Persistent",
          description: "Active in 6 of last 6 months",
          color: "var(--destructive-text)",
          fillOpacity: 0.35,
          center: keyLocations.Jowhar,
          radius: 22000,
        },
        {
          name: "Mogadishu-Afgooye Axis - Persistent",
          description: "Active in 5 of last 6 months",
          color: "var(--warning-strong)",
          fillOpacity: 0.32,
          center: [1.95, 45.04] as [number, number],
          radius: 24000,
        },
        {
          name: "Kismayo Edge - Intermittent",
          description: "Active in 2 of last 6 months",
          color: "var(--text-subtle)",
          fillOpacity: 0.2,
          center: keyLocations.Kismayo,
          radius: 19000,
        },
      ];
      return {
        summary: "Security persistence filter applied to current incident zones.",
        assistantText:
          "**Incident zones that remained active over the last 6 months**\n\n" +
          "This refinement keeps the currently shown zones and classifies persistence so teams can distinguish chronic from intermittent insecurity.\n\n" +
          "Of the 3 zones shown, 2 remained persistently active across most of the last six months.",
        visualMode: "zones",
        matchedAreas: resolvedAreas,
        markers: [],
        zones: persistentZones,
        routes: [],
        legendTitle: "SECURITY PERSISTENCE (6M)",
        legendItems: ["Persistent", "Recurring", "Intermittent"],
      };
    }

    const zones = [
      {
        name: "Mogadishu - Afgooye Corridor - Severe incident pressure",
        description: "Severe | Repeated checkpoint harassment and convoy disruption reports",
        color: "var(--destructive-text)",
        fillOpacity: 0.36,
        center: [1.95, 45.04] as [number, number],
        radius: 25000,
      },
      {
        name: "Jowhar Access Belt - High incident pressure",
        description: "High | Armed movement and extortion incidents on feeder roads",
        color: "var(--warning-strong)",
        fillOpacity: 0.32,
        center: keyLocations.Jowhar,
        radius: 22000,
      },
      {
        name: "Baidoa Peri-Urban Ring - High incident pressure",
        description: "High | Aid movement disruptions and local insecurity spikes",
        color: "var(--warning-strong)",
        fillOpacity: 0.32,
        center: keyLocations.Baidoa,
        radius: 22000,
      },
      {
        name: "Kismayo Logistics Edge - Moderate incident pressure",
        description: "Moderate | Isolated road insecurity events impacting delivery timing",
        color: "var(--warning)",
        fillOpacity: 0.28,
        center: keyLocations.Kismayo,
        radius: 20000,
      },
    ];

    const markers = [
      {
        name: "Afgooye Road Convoy Interdiction",
        description: "Last 30 days | Movement delay and cargo access disruption",
        coords: [1.93, 44.94] as [number, number],
        color: "var(--destructive-text)",
      },
      {
        name: "Jowhar Feeder Road Checkpoint Incident",
        description: "Last 30 days | Temporary access denial for aid vehicles",
        coords: [2.56, 45.36] as [number, number],
        color: "var(--destructive-text)",
      },
      {
        name: "Baidoa Perimeter Route Ambush",
        description: "Last 30 days | Escort requirement activated on route segment",
        coords: [3.05, 43.56] as [number, number],
        color: "var(--warning-strong)",
      },
      {
        name: "Lower Juba Supply Route Incident",
        description: "Last 30 days | Limited-hour movement window enforced",
        coords: [-0.24, 42.63] as [number, number],
        color: "var(--warning)",
      },
      {
        name: "Marka Corridor Intimidation Reports",
        description: "Last 30 days | Elevated threat reporting by partner teams",
        coords: [1.83, 44.83] as [number, number],
        color: "var(--warning-strong)",
      },
    ];

    return {
      summary: "Recent security incidents and hotspot pressure visualized.",
      assistantText:
        "**Security Incidents Affecting Aid Access**\n\n" +
        "Recent incident concentration is highest on the Mogadishu-Afgooye axis, with elevated pressure across Jowhar and Baidoa access belts.\n\n" +
        "A total of 4 hotspot zones and 5 recent incident markers are mapped to show where operational movement is most constrained.\n\n" +
        "The incident list below can be used to prioritize route hardening, convoy timing, and partner security coordination.",
      visualMode: "mixed",
      matchedAreas: resolvedAreas,
      markers,
      zones,
      routes: [],
      legendTitle: "SECURITY INCIDENTS",
      legendItems: ["Severe pressure", "High pressure", "Moderate pressure", "Recent incident marker"],
      secondaryList: {
        title: "Recent Security Incidents",
        items: markers.map((marker, idx) => ({
          id: `security-incident-${idx}`,
          name: marker.name,
          subtitle: marker.description,
          value:
            marker.color === "var(--destructive-text)"
              ? "Severe"
              : marker.color === "var(--warning-strong)"
                ? "High"
                : "Moderate",
          coords: marker.coords,
          color: marker.color,
        })),
      },
    };
  }

  if (isDiversionQuery) {
    if (isDiversionTrendQuery) {
      const trendZones = [
        {
          name: "Jowhar - Sharp increase",
          description: "Change +14 incidents in 3 months | Fastest increase in reported diversion pressure",
          color: "var(--destructive-text)",
          fillOpacity: 0.42,
          center: keyLocations.Jowhar,
          radius: 25000,
        },
        {
          name: "Marka - Strong increase",
          description: "Change +11 incidents in 3 months | Sustained networked diversion pattern",
          color: "var(--warning-strong)",
          fillOpacity: 0.36,
          center: keyLocations.Marka,
          radius: 23000,
        },
        {
          name: "Mogadishu Peri-Urban Belt - Moderate increase",
          description: "Change +7 incidents in 3 months | Growing leakage on peri-urban route nodes",
          color: "var(--warning-strong)",
          fillOpacity: 0.32,
          center: [1.9, 45.27] as [number, number],
          radius: 22000,
        },
        {
          name: "Baidoa - Early warning increase",
          description: "Change +4 incidents in 3 months | Monitoring required before escalation",
          color: "var(--warning)",
          fillOpacity: 0.3,
          center: keyLocations.Baidoa,
          radius: 21000,
        },
      ];

      const trendMarkers = [
        {
          name: "Jowhar checkpoint cluster",
          description: "Largest rise | +14 incidents vs prior quarter",
          coords: keyLocations.Jowhar,
          color: "var(--destructive-text)",
        },
        {
          name: "Marka corridor spillover",
          description: "Second highest rise | +11 incidents",
          coords: keyLocations.Marka,
          color: "var(--warning-strong)",
        },
        {
          name: "Mogadishu peri-urban routes",
          description: "Emerging increase | +7 incidents",
          coords: [1.9, 45.27] as [number, number],
          color: "var(--warning-strong)",
        },
      ];

      return {
        summary: "Diversion risk increase trend mapped for the last 3 months.",
        assistantText:
          "**Where diversion risk increased most (last 3 months)**\n\n" +
          "The sharpest increases are concentrated around Jowhar and Marka, with emerging acceleration along Mogadishu peri-urban routes.\n\n" +
          "Of the major hotspot areas shown, 3 zones account for the strongest quarter-on-quarter rise and are now prioritized for near-term mitigation.",
        visualMode: "mixed",
        matchedAreas: resolvedAreas,
        markers: trendMarkers,
        zones: trendZones,
        routes: [],
        legendTitle: "DIVERSION TREND (3M CHANGE)",
        legendItems: ["Sharp increase", "Strong increase", "Moderate increase", "Early warning"],
        secondaryList: {
          title: "Largest Diversion Increases",
          items: trendZones.map((zone, idx) => ({
            id: `diversion-trend-${idx}`,
            name: zone.name.split(" - ")[0],
            subtitle: zone.description,
            value: zone.description.split("|")[0]?.replace("Change ", "").trim() || "Up",
            coords: zone.center ?? keyLocations.Mogadishu,
            color: zone.color,
          })),
        },
      };
    }

    const zones = [
      {
        name: "Jowhar (Middle Shabelle) - Critical hotspot",
        description: "Critical (30+ cases) | Armed group checkpoints affecting WASH and food flows",
        color: "var(--destructive)",
        fillOpacity: 0.4,
        center: keyLocations.Jowhar,
        radius: 26000,
      },
      {
        name: "Marka (Lower Shabelle) - Critical hotspot",
        description: "Critical (30+ cases) | Systematic diversion pressure along access belt",
        color: "var(--destructive)",
        fillOpacity: 0.4,
        center: keyLocations.Marka,
        radius: 24000,
      },
      {
        name: "Mogadishu - Jowhar Corridor - Critical hotspot",
        description: "Critical (30+ cases) | Corridor nodes with diversion events on movement routes",
        color: "var(--destructive)",
        fillOpacity: 0.4,
        center: [1.96, 45.05] as [number, number],
        radius: 22000,
      },
      {
        name: "Baidoa (Bay) - High diversion zone",
        description: "High (20-29 cases) | Contestation impacting food and transport packets",
        color: "var(--warning-strong)",
        fillOpacity: 0.32,
        center: keyLocations.Baidoa,
        radius: 24000,
      },
      {
        name: "Beledweyne (Hiraan) - High diversion zone",
        description: "High (20-29 cases) | Flood-zone militia suppliers and diversion events",
        color: "var(--warning-strong)",
        fillOpacity: 0.32,
        center: keyLocations.Beledweyne,
        radius: 24000,
      },
      {
        name: "Kismayo (Lower Juba) - Moderate risk zone",
        description: "Moderate (<20 cases) | Logistics edge pressure and peri-urban diversion spillover",
        color: "var(--warning)",
        fillOpacity: 0.28,
        center: keyLocations.Kismayo,
        radius: 21000,
      },
      {
        name: "Mogadishu Peri-Urban Routes - Moderate risk zone",
        description: "Moderate (<20 cases) | Route segments with recurring diversion reports",
        color: "var(--warning)",
        fillOpacity: 0.28,
        center: [1.84, 45.42] as [number, number],
        radius: 20000,
      },
    ];

    return {
      summary: "Aid diversion hotspots and severity bands visualized.",
      assistantText:
        "**Aid Diversion Hotspots in Somalia**\n\n" +
        "Critical diversion risk is concentrated around Jowhar, Marka, and the Mogadishu-Jowhar movement corridor.\n\n" +
        "A total of 7 hotspot zones are mapped, with Baidoa and Beledweyne in high-risk status and Kismayo plus peri-urban Mogadishu in moderate-risk status.\n\n" +
        "The hotspot breakdown is listed below for quick prioritization.",
      visualMode: "zones",
      matchedAreas: resolvedAreas,
      markers: [],
      zones,
      routes: [],
      legendTitle: "AID DIVERSION HOTSPOTS",
      legendItems: ["Critical (30+ cases)", "High (20-29 cases)", "Moderate (<20 cases)"],
      secondaryList: {
        title: "Diversion Hotspots",
        items: zones.map((zone, idx) => ({
          id: `diversion-${idx}`,
          name: zone.name.split(" - ")[0],
          subtitle: zone.description.split("|")[1]?.trim() || zone.description,
          value:
            zone.description.includes("Critical")
              ? "Critical"
              : zone.description.includes("High")
                ? "High"
                : "Moderate",
          coords: zone.center ?? keyLocations.Mogadishu,
          color: zone.color,
        })),
      },
    };
  }

  if (isDroughtQuery) {
    if (isDroughtDisplacementOverlayQuery) {
      const overlayMarkers = [
        { name: "Mogadishu displacement pressure", description: "High overlap: IPC4 + IDP inflow", coords: keyLocations.Mogadishu, color: "var(--destructive-text)" },
        { name: "Baidoa displacement pressure", description: "High overlap: IPC4 + camp expansion", coords: keyLocations.Baidoa, color: "var(--warning-strong)" },
        { name: "Jowhar displacement pressure", description: "Moderate overlap with rising arrivals", coords: keyLocations.Jowhar, color: "var(--warning-strong)" },
      ];
      return {
        summary: "Displacement pressure overlaid on drought priority zones.",
        assistantText:
          "**Displacement pressure over Phase 4 drought zones**\n\n" +
          "This view overlays IDP pressure points on top of drought severity to highlight compound humanitarian stress.\n\n" +
          `Of the priority drought areas shown, ${overlayMarkers.length} now show elevated displacement overlap.`,
        visualMode: "mixed",
        matchedAreas: resolvedAreas,
        markers: overlayMarkers,
        zones: [],
        routes: [],
        legendTitle: "DROUGHT + DISPLACEMENT",
        legendItems: ["High overlap", "Moderate overlap", "Emerging overlap"],
      };
    }

    if (isDroughtPriorityQuery) {
      const priorityZones = [
        {
          name: "Mogadishu - Tier 1 priority",
          description: "Immediate response window | Highest combined severity",
          color: "var(--destructive-text)",
          fillOpacity: 0.42,
          center: keyLocations.Mogadishu,
          radius: 24000,
        },
        {
          name: "Baidoa - Tier 1 priority",
          description: "Immediate response window | Worsening food access",
          color: "var(--destructive-text)",
          fillOpacity: 0.42,
          center: keyLocations.Baidoa,
          radius: 24000,
        },
        {
          name: "Beledweyne - Tier 2 priority",
          description: "Rapid response needed in next cycle",
          color: "var(--warning-strong)",
          fillOpacity: 0.34,
          center: keyLocations.Beledweyne,
          radius: 22000,
        },
      ];
      return {
        summary: "Priority-ranked drought response zones are now highlighted.",
        assistantText:
          "**Districts to prioritize first for response**\n\n" +
          "This refinement ranks drought-affected areas into immediate and near-term response tiers for faster operational sequencing.\n\n" +
          "Tier 1 currently includes Mogadishu and Baidoa, with Beledweyne as next-line Tier 2 priority.",
        visualMode: "zones",
        matchedAreas: resolvedAreas,
        markers: [],
        zones: priorityZones,
        routes: [],
        legendTitle: "RESPONSE PRIORITY TIERS",
        legendItems: ["Tier 1 immediate", "Tier 2 near-term"],
      };
    }

    const zones = [
      {
        name: "Mogadishu (Banadir) - IPC Phase 4 - Emergency",
        description: "IPC Phase 4 | Elevated emergency food insecurity risk",
        color: "var(--destructive)",
        fillOpacity: 0.45,
        center: keyLocations.Mogadishu,
        radius: 26000,
      },
      {
        name: "Baidoa (Bay) - IPC Phase 4 - Emergency",
        description: "IPC Phase 4 | Emergency-level stress in agricultural belt",
        color: "var(--destructive)",
        fillOpacity: 0.45,
        center: keyLocations.Baidoa,
        radius: 26000,
      },
      {
        name: "Beledweyne (Hiraan) - IPC Phase 4 - Emergency",
        description: "IPC Phase 4 | Riverine and trade-route disruption",
        color: "var(--destructive)",
        fillOpacity: 0.45,
        center: keyLocations.Beledweyne,
        radius: 25000,
      },
      {
        name: "Jowhar (Middle Shabelle) - IPC Phase 4 - Emergency",
        description: "IPC Phase 4 | Water access and market constraints",
        color: "var(--destructive)",
        fillOpacity: 0.45,
        center: keyLocations.Jowhar,
        radius: 25000,
      },
      {
        name: "Marka (Lower Shabelle) - IPC Phase 3 - Crisis",
        description: "IPC Phase 3 | Serious stress and diversion effects",
        color: "var(--warning-strong)",
        fillOpacity: 0.36,
        center: keyLocations.Marka,
        radius: 23000,
      },
      {
        name: "Dollow (Gedo) - IPC Phase 3 - Crisis",
        description: "IPC Phase 3 | Drought pressure and access constraints",
        color: "var(--warning-strong)",
        fillOpacity: 0.36,
        center: keyLocations.Dollow,
        radius: 22500,
      },
      {
        name: "Kismayo (Lower Juba) - IPC Phase 3 - Crisis",
        description: "IPC Phase 3 | Logistics disruption affecting supplies",
        color: "var(--warning-strong)",
        fillOpacity: 0.36,
        center: keyLocations.Kismayo,
        radius: 22000,
      },
      {
        name: "Garowe (Northeast) - IPC Phase 2 - Stressed",
        description: "IPC Phase 2 | Stressed pockets with rising needs",
        color: "var(--warning)",
        fillOpacity: 0.3,
        center: keyLocations.Garowe,
        radius: 21000,
      },
    ];

    return {
      summary: "Projected drought and food insecurity zones are now highlighted.",
      assistantText:
        "**Drought and Food Insecurity Outlook (IPC)**\n\n" +
        "Over the next 90 days, the highest deterioration risk is concentrated in Mogadishu, Baidoa, Beledweyne, and Jowhar (IPC Phase 4).\n\n" +
        "Secondary escalation risk is visible in Marka, Dollow, and Kismayo (IPC Phase 3), while Garowe remains stressed (Phase 2) and should be monitored for upward movement.\n\n" +
        "A total of 8 priority zones are mapped below to support immediate planning for food assistance, water trucking, and mobile health coverage.",
      visualMode: "zones",
      matchedAreas: resolvedAreas,
      markers: [],
      zones,
      routes: [],
      legendTitle: "HUNGER PROJECTION",
      legendItems: ["IPC Phase 4 - Emergency", "IPC Phase 3 - Crisis", "IPC Phase 2 - Stressed"],
      secondaryList: {
        title: "IPC Priority Areas",
        items: zones.map((zone, idx) => ({
          id: `ipc-${idx}`,
          name: zone.name.split(" - ")[0],
          subtitle: zone.description,
          value: zone.name.includes("Phase 4") ? "P4" : zone.name.includes("Phase 3") ? "P3" : "P2",
          coords: zone.center ?? keyLocations.Mogadishu,
          color: zone.color,
        })),
      },
    };
  }

  return {
    summary:
      matchedAreas.length > 0
        ? `Focused on ${areaNames.join(", ")} with mixed risk overlays.`
        : "No specific location detected, so the map highlighted key Somalia risk areas.",
    assistantText:
      "**Somalia Risk Overview Snapshot**\n\n" +
      `Current focus areas are ${areaNames.join(", ")}, with mixed overlays for hotspot comparison.\n\n` +
      "You can now drill down into one layer (IDP camps, diversion risk, drought pressure, or access routes) for a more specific operational view.",
    visualMode: "mixed",
    matchedAreas: resolvedAreas,
    markers: resolvedAreas.map((area) => ({
      name: area.name,
      description: `${area.name} risk level | ${area.riskLevel}`,
      coords: area.center,
      color: area.riskLevel === "High" ? "var(--destructive)" : area.riskLevel === "Medium" ? "var(--warning)" : "var(--success)",
    })),
    zones: resolvedAreas.map((area) => ({
      name: `${area.name} risk boundary`,
      description: `${area.name} boundary | Risk: ${area.riskLevel}`,
      color: area.riskLevel === "High" ? "var(--destructive)" : area.riskLevel === "Medium" ? "var(--warning)" : "var(--success)",
      fillOpacity: 0.18,
      polygon: area.polygon,
    })),
    routes: [],
    legendTitle: "RISK OVERVIEW",
    legendItems: ["High", "Medium", "Stable"],
  };
};

type HistoryItem = {
  id: number;
  text: string;
  createdAt: string;
  stepCount: number;
};

type SuggestedFollowUp = {
  id: string;
  text: string;
};

const buildFollowUpSuggestions = (visualization: QueryVisualizationResult, query: string): SuggestedFollowUp[] => {
  const normalized = query.toLowerCase();
  const suggestions: SuggestedFollowUp[] = [];

  if (normalized.includes("idp") || normalized.includes("camp") || normalized.includes("refugee")) {
    suggestions.push(
      { id: "idp-last-6m", text: "Which of these sites have stayed active in the last 6 months?" },
      { id: "idp-service-gaps", text: "Which camps in this layer have the largest service gaps?" }
    );
  } else if (
    normalized.includes("diversion") ||
    normalized.includes("checkpoint") ||
    normalized.includes("aid diversion")
  ) {
    suggestions.push(
      { id: "diversion-routes", text: "Show the supply routes affected by these hotspots." },
      { id: "diversion-change", text: "Where has diversion risk increased most in the last 3 months?" }
    );
  } else if (
    normalized.includes("security") ||
    normalized.includes("incident") ||
    normalized.includes("attack")
  ) {
    suggestions.push(
      { id: "security-routes", text: "Which corridors are repeatedly impacted by these incidents?" },
      { id: "security-6m", text: "Which of these incident zones remained active over the last 6 months?" }
    );
  } else if (
    normalized.includes("route") ||
    normalized.includes("corridor") ||
    normalized.includes("road")
  ) {
    suggestions.push(
      { id: "route-hotspots", text: "Overlay diversion hotspots along these active corridors." },
      { id: "route-alt", text: "Which alternative routes are currently lower risk?" }
    );
  } else if (
    normalized.includes("drought") ||
    normalized.includes("food insecurity") ||
    normalized.includes("ipc")
  ) {
    suggestions.push(
      { id: "drought-idp", text: "Overlay displacement pressure on the Phase 4 zones." },
      { id: "drought-priority", text: "Which districts should be prioritized first for response?" }
    );
  } else {
    if (visualization.visualMode !== "routes") {
      suggestions.push({ id: "generic-routes", text: "Show me the supply routes affected by this." });
    }
    suggestions.push({ id: "generic-trend", text: "What changed most in these areas in the last 6 months?" });
  }

  return suggestions.slice(0, 2);
};

const isRefinementPrompt = (query: string) => {
  const normalized = query.toLowerCase();
  const refinementSignals = [
    "these",
    "those",
    "them",
    "which of",
    "which of them",
    "which of these",
    "how many",
    "still active",
    "stayed active",
    "active in the last",
    "from this list",
    "in this layer",
    "currently shown",
  ];

  return refinementSignals.some((signal) => normalized.includes(signal));
};

export function MapIntelligence() {
  const [mapQuery, setMapQuery] = useState("");
  const [isPromptCollapsed, setIsPromptCollapsed] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMobilePromptOpen, setIsMobilePromptOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [lastQuerySummary, setLastQuerySummary] = useState(
    "Ask a map question to highlight areas of interest."
  );
  const [mapLegend, setMapLegend] = useState<{ title: string; items: string[] } | null>(null);
  const [latestVisualization, setLatestVisualization] = useState<QueryVisualizationResult | null>(null);
  const [layeredVisualizations, setLayeredVisualizations] = useState<QueryVisualizationResult[]>([]);
  const [activeSecondaryList, setActiveSecondaryList] = useState<QueryVisualizationResult["secondaryList"] | null>(null);
  const [suggestedFollowUps, setSuggestedFollowUps] = useState<SuggestedFollowUp[]>([]);
  const [selectedListItemId, setSelectedListItemId] = useState<string | null>(null);
  const [contextAnchorQuery, setContextAnchorQuery] = useState<string | null>(null);
  const [isAssistantStreaming, setIsAssistantStreaming] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const overlayLayerGroupRef = useRef<any>(null);
  const streamTimerRef = useRef<number | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    const syncViewport = () => {
      setIsMobileViewport(window.innerWidth < 768);
    };

    syncViewport();
    window.addEventListener("resize", syncViewport);
    return () => window.removeEventListener("resize", syncViewport);
  }, []);

  useEffect(() => {
    return () => {
      if (streamTimerRef.current) {
        window.clearTimeout(streamTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) {
      return;
    }

    import("leaflet").then((L) => {
      if (!mapRef.current || mapInstanceRef.current) {
        return;
      }

      const map = L.map(mapRef.current, {
        zoomControl: false,
      }).setView([5.1521, 46.1996], 6);

      L.control
        .zoom({
          position: "bottomright",
        })
        .addTo(map);

      const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string | undefined;
      const rawMapboxStyle = (import.meta.env.VITE_MAPBOX_STYLE_ID as string | undefined) || "mapbox/streets-v12";
      const mapboxStylePath = rawMapboxStyle
        .replace(/^mapbox:\/\/styles\//, "")
        .replace(/^styles\//, "");

      if (mapboxToken) {
        L.tileLayer(
          `https://api.mapbox.com/styles/v1/${mapboxStylePath}/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`,
          {
            tileSize: 512,
            zoomOffset: -1,
            maxZoom: 20,
            attribution:
              '© <a href="https://www.mapbox.com/about/maps/" target="_blank">Mapbox</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
          }
        ).addTo(map);
      } else {
        // Fallback keeps the module usable when token is missing in local env.
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);
        console.warn("VITE_MAPBOX_ACCESS_TOKEN is missing. Falling back to OpenStreetMap tiles.");
      }

      overlayLayerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) {
      return;
    }

    const resizeMap = () => {
      mapInstanceRef.current?.invalidateSize();
    };

    resizeMap();

    const observer = new ResizeObserver(() => {
      resizeMap();
    });
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) {
      return;
    }

    // Leaflet needs an explicit resize after container width transitions.
    mapInstanceRef.current.invalidateSize();
    const resizeTimer = window.setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 320);

    return () => window.clearTimeout(resizeTimer);
  }, [isPromptCollapsed, isMobilePromptOpen]);

  const renderQueryOverlays = (query: string, options?: { refineInPlace?: boolean; anchorQuery?: string }): QueryVisualizationResult | null => {
    if (!mapInstanceRef.current || !overlayLayerGroupRef.current) {
      return null;
    }

    const refineInPlace = Boolean(options?.refineInPlace);
    const mergedQuery = refineInPlace && options?.anchorQuery ? `${options.anchorQuery}. ${query}` : query;
    const visualization = inferQueryVisualization(mergedQuery, query);
    const nextLayeredVisualizations = [visualization];

    setLastQuerySummary(
      refineInPlace
        ? `${visualization.summary} Refined from the currently shown results.`
        : visualization.summary
    );
    setMapLegend({
      title: visualization.legendTitle,
      items: visualization.legendItems,
    });
    setLatestVisualization(visualization);
    setLayeredVisualizations(nextLayeredVisualizations);
    setActiveSecondaryList(visualization.secondaryList ?? null);
    setSuggestedFollowUps(buildFollowUpSuggestions(visualization, query));
    setSelectedListItemId(null);

    import("leaflet").then((L) => {
      const map = mapInstanceRef.current;
      const overlayLayer = overlayLayerGroupRef.current;
      if (!map || !overlayLayer) {
        return;
      }
      overlayLayer.clearLayers();

      nextLayeredVisualizations.forEach((layer) => {
        const isLatestLayer = true;
        const layerFactor = 1;
        const routeOpacity = 0.88;

        layer.zones.forEach((zone) => {
          const tooltipHtml = `<div style="min-width:160px;">
            <div style="font-weight:600;color:var(--foreground-emphasis);">${zone.name}</div>
            <div style="color:var(--foreground-emphasis);margin-top:2px;">${zone.description}</div>
          </div>`;

          if (zone.polygon) {
            L.polygon(zone.polygon, {
              color: zone.color,
              weight: isLatestLayer ? 2 : 1.3,
              fillColor: zone.color,
              fillOpacity: zone.fillOpacity * layerFactor,
              dashArray: isLatestLayer ? "5 5" : "3 6",
            })
              .bindTooltip(tooltipHtml, {
                sticky: true,
                direction: "top",
                opacity: 0.96,
                className: "map-hover-tooltip",
              })
              .bindPopup(`<strong>${zone.name}</strong><br/>${zone.description}`)
              .addTo(overlayLayer);
            return;
          }

          if (zone.center && zone.radius) {
            L.circle(zone.center, {
              radius: zone.radius,
              color: zone.color,
              weight: isLatestLayer ? 2 : 1.3,
              fillColor: zone.color,
              fillOpacity: zone.fillOpacity * layerFactor,
            })
              .bindTooltip(tooltipHtml, {
                sticky: true,
                direction: "top",
                opacity: 0.96,
                className: "map-hover-tooltip",
              })
              .bindPopup(`<strong>${zone.name}</strong><br/>${zone.description}`)
              .addTo(overlayLayer);
          }
        });

        layer.markers.forEach((marker) => {
          L.marker(marker.coords, {
            icon: L.divIcon({
              className: "map-point-pin-icon",
              html: buildMapPinIconHtml(marker.color),
              iconSize: [24, 34],
              iconAnchor: [12, 34],
              popupAnchor: [0, -28],
              tooltipAnchor: [0, -28],
            }),
            opacity: isLatestLayer ? 1 : 0.68,
          })
            .bindTooltip(
              `<div style="min-width:150px;">
                <div style="font-weight:600;color:var(--foreground-emphasis);">${marker.name}</div>
                <div style="color:var(--foreground-emphasis);margin-top:2px;">${marker.description}</div>
              </div>`,
              {
                sticky: true,
                direction: "top",
                opacity: 0.96,
                className: "map-hover-tooltip",
              }
            )
            .bindPopup(`<strong>${marker.name}</strong><br/>${marker.description}`)
            .addTo(overlayLayer);
        });

        layer.routes.forEach((route) => {
          L.polyline(route.path, {
            color: route.color,
            weight: isLatestLayer ? 4 : 2.8,
            opacity: routeOpacity,
            dashArray: isLatestLayer ? "8 8" : "4 8",
          })
            .bindTooltip(
              `<div style="min-width:170px;">
                <div style="font-weight:600;color:var(--foreground-emphasis);">${route.name}</div>
                <div style="color:var(--foreground-emphasis);margin-top:2px;">${route.description}</div>
              </div>`,
              {
                sticky: true,
                direction: "top",
                opacity: 0.96,
                className: "map-hover-tooltip",
              }
            )
            .bindPopup(`<strong>${route.name}</strong><br/>${route.description}`)
            .addTo(overlayLayer);
        });
      });

      const boundsPoints: [number, number][] = [];
      nextLayeredVisualizations.forEach((layer) => {
        layer.zones.forEach((zone) => {
          if (zone.polygon) {
            boundsPoints.push(...zone.polygon);
          }
          if (zone.center) {
            boundsPoints.push(zone.center);
          }
        });
        layer.markers.forEach((marker) => boundsPoints.push(marker.coords));
        layer.routes.forEach((route) => boundsPoints.push(...route.path));
        layer.matchedAreas.forEach((area) => boundsPoints.push(area.center));
      });

      if (boundsPoints.length > 0) {
        map.fitBounds(boundsPoints as any, { padding: [40, 40], maxZoom: 8 });
      }
    });

    return visualization;
  };

  const focusSecondaryListItem = (item: NonNullable<QueryVisualizationResult["secondaryList"]>["items"][number]) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    setSelectedListItemId(item.id);
    map.flyTo(item.coords, 10, { duration: 0.8 });
  };

  const submitMapQuery = (query: string, options?: { isFollowUp?: boolean }) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return;
    }
    const hasPriorContext = Boolean(options?.isFollowUp && contextAnchorQuery);
    const refineInPlace = hasPriorContext && isRefinementPrompt(trimmedQuery);
    const anchorQuery = hasPriorContext ? contextAnchorQuery : null;

    const nextStepCount = Math.floor(chatMessages.length / 2) + 1;
    const newHistoryItem: HistoryItem = {
      id: Date.now(),
      text: refineInPlace ? `↳ ${trimmedQuery}` : trimmedQuery,
      createdAt: "Just now",
      stepCount: nextStepCount,
    };

    const visualization = renderQueryOverlays(trimmedQuery, {
      refineInPlace,
      anchorQuery: refineInPlace ? anchorQuery ?? undefined : undefined,
    });
    if (!refineInPlace) {
      setContextAnchorQuery(trimmedQuery);
    }

    const now = Date.now();
    const userMessage: ChatMessage = {
      id: now,
      role: "user",
      content: trimmedQuery,
    };
    const assistantMessageId = now + 1;
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
    };

    setChatMessages((prev) => [...prev, userMessage, assistantMessage]);
    setIsAssistantStreaming(true);

    const fullAssistantText = visualization?.assistantText ?? "Map focus updated based on your prompt.";
    const textParts = fullAssistantText.split(/(\s+)/).filter((part) => part.length > 0);
    let cursor = 0;

    if (streamTimerRef.current) {
      window.clearTimeout(streamTimerRef.current);
    }

    const streamNextPart = () => {
      if (cursor >= textParts.length) {
        streamTimerRef.current = null;
        setIsAssistantStreaming(false);
        return;
      }

      const nextChunk = textParts[cursor];
      setChatMessages((prev) =>
        prev.map((message) =>
          message.id === assistantMessageId
            ? { ...message, content: `${message.content}${nextChunk}` }
            : message
        )
      );
      cursor += 1;
      streamTimerRef.current = window.setTimeout(streamNextPart, 28);
    };

    streamNextPart();

    setHistoryItems((prev) => [newHistoryItem, ...prev]);
    setIsHistoryOpen(false);
    if (isMobileViewport) {
      setIsMobilePromptOpen(true);
    }
    setMapQuery("");
  };

  const handleBackToBaseScreen = () => {
    setChatMessages([]);
    setMapQuery("");
    setLastQuerySummary("Ask a map question to highlight areas of interest.");
    setMapLegend(null);
    setLatestVisualization(null);
    setLayeredVisualizations([]);
    setActiveSecondaryList(null);
    setSuggestedFollowUps([]);
    setContextAnchorQuery(null);
    setSelectedListItemId(null);
    setIsAssistantStreaming(false);
    if (overlayLayerGroupRef.current) {
      overlayLayerGroupRef.current.clearLayers();
    }
    mapInstanceRef.current?.setView([5.1521, 46.1996], 6);
  };

  return (
    <div className="h-full bg-background pt-0">
      <div className="relative h-full overflow-hidden flex flex-col md:flex-row">
        {/* Map area */}
        <section ref={mapContainerRef} className="relative flex-1 min-h-0 min-w-0 bg-foreground">
          <div ref={mapRef} className="absolute inset-0" />
          {mapLegend && (
            <div className="absolute top-4 left-4 z-[1200] w-[220px] rounded-xl border border-foreground-emphasis bg-foreground-emphasis/90 p-3 text-border-muted shadow-lg">
              <div className="text-xs font-semibold tracking-wide text-primary-subtle uppercase">{mapLegend.title}</div>
              <div className="mt-2 space-y-1.5">
                {mapLegend.items.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Prompt area */}
        <aside
          className={`border-l border-border bg-card flex flex-col transition-all duration-300 ${
            isMobileViewport
              ? `absolute inset-x-0 bottom-0 z-[1220] max-h-[72dvh] rounded-t-2xl border-t border-border shadow-2xl ${
                  isMobilePromptOpen ? "translate-y-0" : "translate-y-full pointer-events-none"
                }`
              : isPromptCollapsed
                ? "w-full md:w-[76px]"
                : "w-full md:w-[360px]"
          }`}
        >
          <div
            className={`flex items-center ${
              isPromptCollapsed
                ? "px-3 py-4 justify-center"
                : isHistoryOpen
                  ? "px-5 py-5 justify-between border-b border-border"
                  : "px-5 py-4 justify-between"
            }`}
          >
            {!isPromptCollapsed && (
              <>
                {isHistoryOpen ? (
                  <>
                    <div className="flex items-center gap-2">
                      <History size={16} className="text-primary" />
                      <h3 className="text-lg font-semibold leading-tight text-foreground">Query History</h3>
                    </div>
                    <button
                      onClick={() => setIsHistoryOpen(false)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-text-subtle hover:bg-muted hover:text-muted-foreground"
                      aria-label="Close history"
                      title="Close history"
                    >
                      <X size={20} />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      {chatMessages.length > 0 && (
                        <button
                          onClick={handleBackToBaseScreen}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border text-muted-foreground hover:bg-muted"
                          aria-label="Back to base screen"
                          title="Back to base screen"
                        >
                          <ArrowLeft size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => setIsHistoryOpen(true)}
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground border border-border rounded-lg px-2.5 py-1.5 hover:bg-muted"
                      >
                        <History size={14} />
                        History
                      </button>
                    </div>
                    <button
                      onClick={() => (isMobileViewport ? setIsMobilePromptOpen((prev) => !prev) : setIsPromptCollapsed((prev) => !prev))}
                      aria-label={isPromptCollapsed ? "Expand prompt panel" : "Collapse prompt panel"}
                      title={isPromptCollapsed ? "Expand panel" : "Collapse panel"}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border text-muted-foreground hover:bg-muted"
                    >
                      {isMobileViewport ? (
                        isMobilePromptOpen ? (
                          <X size={16} />
                        ) : (
                          <MessageSquareText size={16} />
                        )
                      ) : isPromptCollapsed ? (
                        <PanelRightOpen size={16} />
                      ) : (
                        <PanelRightClose size={16} />
                      )}
                    </button>
                  </>
                )}
              </>
            )}
            {isPromptCollapsed && !isMobileViewport && (
              <button
                onClick={() => setIsPromptCollapsed((prev) => !prev)}
                aria-label={isPromptCollapsed ? "Expand prompt panel" : "Collapse prompt panel"}
                title={isPromptCollapsed ? "Expand panel" : "Collapse panel"}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border text-muted-foreground hover:bg-muted"
              >
                {isPromptCollapsed ? <PanelRightOpen size={16} /> : <PanelRightClose size={16} />}
              </button>
            )}
          </div>

          {(!isPromptCollapsed || isMobileViewport) && (
            <>
              <div className="flex-1 overflow-auto p-5">
                {isHistoryOpen ? (
                  <div className="h-full flex flex-col">
                    <div className="space-y-3">
                      {historyItems.map((item) => (
                        <div key={item.id} className="rounded-2xl border border-border bg-card px-4 py-4">
                          <p className="text-base font-semibold text-foreground leading-snug">{item.text}</p>
                          <div className="mt-1 flex items-center gap-1.5 text-sm text-text-subtle">
                            <Clock3 size={12} />
                            <span>
                              {item.createdAt} - {item.stepCount} step
                            </span>
                          </div>
                          <p className="mt-2 text-base text-secondary-foreground">"{item.text}"</p>
                        </div>
                      ))}
                      {historyItems.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-border-muted bg-muted px-4 py-6 text-center text-sm text-muted-foreground">
                          No query history yet. Ask a map risk question to get started.
                        </div>
                      )}
                    </div>

                    <div className="mt-auto pt-5">
                      <button
                        onClick={() => setHistoryItems([])}
                        disabled={historyItems.length === 0}
                        className="w-full h-12 rounded-2xl border border-border text-base font-medium text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Clear All History
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full">
                    {chatMessages.length === 0 ? (
                      <div className="h-full" />
                    ) : (
                      <div className="space-y-4">
                        {chatMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                          >
                            {message.role === "user" ? (
                              <div className="max-w-[88%] rounded-2xl bg-primary px-4 py-2.5 text-sm font-medium text-white">
                                {message.content}
                              </div>
                            ) : (
                              <div className="max-w-[96%] rounded-2xl border border-border bg-gradient-to-br from-primary-subtle to-secondary px-4 py-3.5 text-sm leading-relaxed text-secondary-foreground">
                                {latestVisualization?.responseCard && message.id === chatMessages[chatMessages.length - 1]?.id ? (
                                  <div className="space-y-3">
                                    <div>{renderAssistantMessage(message.content)}</div>
                                  </div>
                                ) : (
                                  <div>{renderAssistantMessage(message.content)}</div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                        {!isAssistantStreaming && activeSecondaryList && activeSecondaryList.items.length > 0 && (
                          <div className="space-y-2 pl-1">
                            <div className="text-xs font-semibold uppercase tracking-wide text-text-subtle">
                              {activeSecondaryList.title}
                            </div>
                            <div className="max-h-[280px] space-y-2 overflow-auto pr-1">
                              {activeSecondaryList.items.map((item) => (
                                <button
                                  key={item.id}
                                  onClick={() => focusSecondaryListItem(item)}
                                  className={`w-full rounded-2xl border px-3 py-3 text-left transition-colors ${
                                    selectedListItemId === item.id
                                      ? "border-primary bg-primary-subtle"
                                      : "border-border bg-card hover:border-primary hover:bg-primary-subtle"
                                  }`}
                                >
                                  <div className="flex items-start gap-2">
                                    <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                    <div className="min-w-0 flex-1">
                                      <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
                                      <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>
                                    </div>
                                    <span className="text-sm font-semibold text-foreground-emphasis">{item.value}</span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        {!isAssistantStreaming && suggestedFollowUps.length > 0 && (
                          <div className="space-y-2 pl-1 pt-2">
                            <div className="text-xs font-semibold uppercase tracking-wide text-text-subtle">
                              Suggested Next
                            </div>
                            <div className="space-y-2">
                              {suggestedFollowUps.map((suggestion) => (
                                <button
                                  key={suggestion.id}
                                  onClick={() => submitMapQuery(suggestion.text, { isFollowUp: true })}
                                  className="w-full rounded-xl border border-border bg-card px-3.5 py-3 text-left text-sm font-medium text-primary transition-colors hover:border-primary hover:bg-primary-subtle"
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <span className="leading-snug">{suggestion.text}</span>
                                    <ChevronRight size={15} className="shrink-0 text-chart-2" />
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        <div ref={chatEndRef} />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-4 space-y-3">
                {!isHistoryOpen && (
                  <>
                    {chatMessages.length === 0 && (
                      <>
                        <div className="space-y-3">
                          {riskPrompts.map((prompt) => (
                            <button
                              key={prompt.text}
                              onClick={() => submitMapQuery(prompt.text, { isFollowUp: false })}
                              className="w-full text-left px-4 py-3.5 rounded-2xl border border-border hover:border-border-muted hover:bg-muted transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${prompt.iconBgClass}`}>
                                  <prompt.icon size={18} className={prompt.iconClass} />
                                </div>
                                <span className="flex-1 text-sm font-medium text-secondary-foreground leading-snug">{prompt.text}</span>
                                <ChevronRight size={16} className="text-border-muted" />
                              </div>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}
                <div className="relative">
                  <input
                    value={mapQuery}
                    onChange={(e) => setMapQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        submitMapQuery(mapQuery, { isFollowUp: chatMessages.length > 0 });
                      }
                    }}
                    placeholder="Ask a question about map risks..."
                    className="w-full h-11 border border-border rounded-xl pl-4 pr-11 text-sm text-foreground placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary"
                  />
                  <button
                    onClick={() => submitMapQuery(mapQuery, { isFollowUp: chatMessages.length > 0 })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle hover:text-muted-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                    disabled={!mapQuery.trim()}
                  >
                    <SendHorizontal size={18} />
                  </button>
                </div>
              </div>
            </>
          )}
        </aside>

        {isMobileViewport && !isMobilePromptOpen && (
          <button
            onClick={() => setIsMobilePromptOpen(true)}
            className="md:hidden absolute bottom-5 right-4 z-[1230] inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/30"
          >
            <MessageSquareText size={16} />
            Map assistant
          </button>
        )}
      </div>
    </div>
  );
}
