// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { filterBoreholesQueryOptions, FilterResponse } from "../../../../../api/borehole.ts";
import { Profile } from "../../../../../api/generated";
import { ProfileFilePicker } from "./profileFilePicker.tsx";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const uploadProfile = vi.fn<(boreholeId: number, file: File) => Promise<Profile>>();
vi.mock("../../../../../api/profile.ts", () => ({
  uploadProfile: (boreholeId: number, file: File) => uploadProfile(boreholeId, file),
  useProfiles: () => ({ data: [], isLoading: false }),
  useReloadProfiles: () => () => undefined,
}));

const overviewQuery = filterBoreholesQueryOptions({});
const overviewResponse: FilterResponse = {
  totalCount: 0,
  pageNumber: 1,
  pageSize: 100,
  totalPages: 0,
  boreholes: [],
  geoJson: null,
  selectableBoreholeIds: [],
};

const renderPicker = () => {
  const client = new QueryClient();
  client.setQueryData(overviewQuery.queryKey, overviewResponse);
  render(
    <QueryClientProvider client={client}>
      <ProfileFilePicker boreholeId={7} open={true} setOpen={() => undefined} setSelectedFile={() => undefined} />
    </QueryClientProvider>,
  );
  return client;
};

const isOverviewStale = (client: QueryClient) => client.getQueryState(overviewQuery.queryKey)?.isInvalidated;

describe("ProfileFilePicker", () => {
  afterEach(() => {
    cleanup();
    uploadProfile.mockReset();
  });

  it("leaves the overview fresh while no profile is uploaded", () => {
    const client = renderPicker();

    expect(isOverviewStale(client)).toBe(false);
  });

  it("marks the overview stale after uploading a profile, which the has profiles filter depends on", async () => {
    const uploaded: Profile = { id: 3, boreholeId: 7, name: "profile.pdf" };
    uploadProfile.mockResolvedValue(uploaded);
    const file = new File(["%PDF"], "profile.pdf", { type: "application/pdf" });
    const client = renderPicker();

    fireEvent.change(screen.getByLabelText("addProfile"), { target: { files: [file] } });

    await waitFor(() => expect(isOverviewStale(client)).toBe(true));
    expect(uploadProfile).toHaveBeenCalledWith(7, file);
  });
});
